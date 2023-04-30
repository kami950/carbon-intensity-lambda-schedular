data "archive_file" "lambda_archive" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda_src"
  output_path = "lambda_src.zip"
}

resource "aws_lambda_function" "function" {
  filename         = data.archive_file.lambda_archive.output_path
  function_name    = "${var.STAGE}-${var.PROJECT_NAME}-Lambda"
  handler          = "index.handler"
  role             = aws_iam_role.lambda-role.arn
  runtime          = var.LAMBDA_RUNTIME
  source_code_hash = base64sha256(filebase64(data.archive_file.lambda_archive.output_path))
  publish          = true
  timeout          = 45

  environment {
    variables = {
      CARBON_INTENSITY_API = var.CARBON_INTENSITY_API
      CARBON_INTENSITY_API_REGION_ID = var.CARBON_INTENSITY_API_REGION_ID
      // todo: sure there is a way to get invoke_lambda_event_rule.name but can't figure it out!
      // at the moment this needs to be the same as invoke_lambda_event_rule.name (line 44)
      SCHEDULED_EVENT_RULE_NAME =  "${var.STAGE}-${var.PROJECT_NAME}-lambda-event-rule"
    }
  }
}

resource "aws_iam_role" "lambda-role" {
  name               = "${var.STAGE}-${var.PROJECT_NAME}-role"
  assume_role_policy = file("${path.module}/iam_docs/lambda-role.json")
}

resource "aws_iam_role_policy" "lambda-role-policy" {
  name = "${var.STAGE}-${var.PROJECT_NAME}-role-policy"
  role = aws_iam_role.lambda-role.id

  policy = file("${path.module}/iam_docs/lambda-policy.json")
}

/**
  This runs at 1 minute so the Lambda can be ready to run properly tomorrow!
**/
resource "aws_cloudwatch_event_rule" "invoke_lambda_event_rule" {
  name = "${var.STAGE}-${var.PROJECT_NAME}-lambda-event-rule"
  description = "retry scheduled at X time"
  schedule_expression = "rate(1 minute)"
}

resource "aws_cloudwatch_event_target" "invoke_lambda_target" {
  arn = aws_lambda_function.function.arn
  rule = aws_cloudwatch_event_rule.invoke_lambda_event_rule.name
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_lambda" {
  statement_id = "AllowExecutionFromCloudWatch"
  action = "lambda:InvokeFunction"
  function_name =  aws_lambda_function.function.function_name
  principal = "events.amazonaws.com"
  source_arn = aws_cloudwatch_event_rule.invoke_lambda_event_rule.arn
}
