using System;

namespace EchoIsles.Server.Filters
{

    public class ApiException : Exception
    {
        public int StatusCode { get; set; }

        public ValidationErrorCollection Errors { get; set; }

        public ApiException(string message, int statusCode = 500, ValidationErrorCollection errors = null) :
            base(message)
        {
            this.StatusCode = statusCode;
            this.Errors = errors;
        }
        public ApiException(Exception ex, int statusCode = 500) : base(ex.Message)
        {
            this.StatusCode = statusCode;
        }
    }

}