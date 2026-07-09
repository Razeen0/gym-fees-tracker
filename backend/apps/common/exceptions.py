from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        errors = response.data
        response.data = {
            "success": False,
            "message": _get_error_message(exc, response),
            "data": None,
            "errors": _format_errors(errors),
        }
        response.status_code = response.status_code

    return response


def _get_error_message(exc, response):
    detail = getattr(exc, "detail", None)
    if detail and isinstance(detail, str):
        return detail
    status_code = response.status_code
    messages = {
        400: "Bad request. Please check your input.",
        401: "Authentication failed. Please provide valid credentials.",
        403: "You do not have permission to perform this action.",
        404: "The requested resource was not found.",
        405: "Method not allowed.",
        406: "Not acceptable.",
        415: "Unsupported media type.",
        429: "Too many requests. Please try again later.",
        500: "Internal server error. Please try again later.",
    }
    return messages.get(status_code, "An error occurred.")


def _format_errors(errors):
    formatted = []
    if isinstance(errors, dict):
        for field, messages in errors.items():
            if isinstance(messages, list):
                for msg in messages:
                    formatted.append({"field": field, "message": str(msg)})
            else:
                formatted.append({"field": field, "message": str(messages)})
    elif isinstance(errors, list):
        formatted = [{"field": None, "message": str(e)} for e in errors]
    else:
        formatted = [{"field": None, "message": str(errors)}]
    return formatted
