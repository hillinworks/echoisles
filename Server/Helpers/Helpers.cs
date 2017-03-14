using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.ResponseCompression;
using Serilog;
using Serilog.Events;

namespace EchoIsles.Server.Helpers
{
    public static class Helpers
    {
        public static void SetupSerilog()
        {
            // Configure Serilog
            Log.Logger = new LoggerConfiguration()
            .MinimumLevel
            .Information()
            .WriteTo.RollingFile("logs/log-{Date}.txt", LogEventLevel.Information) // Uncomment if logging required on text file
            .WriteTo.Seq("http://localhost:5341/")
            .CreateLogger();
        }

        public static IEnumerable<string> DefaultMimeTypes => ResponseCompressionDefaults.MimeTypes.Concat(new[]
                                {
                                    "image/svg+xml",
                                    "application/font-woff2"
                                });
    }
}