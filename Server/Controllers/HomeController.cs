// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using EchoIsles.Server.Entities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace EchoIsles.Server.Controllers
{
    public class HomeController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IHostingEnvironment _env;

        public HomeController(UserManager<ApplicationUser> userManager, IHostingEnvironment env)
        {
            _userManager = userManager;
            _env = env;
        }

        public async Task<IActionResult> Index()
        {
            this.ViewBag.MainDotJs = await this.GetMainDotJs();

            if (this.Request.Query.ContainsKey("emailConfirmCode") &&
                this.Request.Query.ContainsKey("userId"))
            {
                var userId = this.Request.Query["userId"].ToString();
                var code = this.Request.Query["emailConfirmCode"].ToString();
                code = code.Replace(" ", "+");

                var applicationUser = await _userManager.FindByIdAsync(userId);
                if (applicationUser != null && !applicationUser.EmailConfirmed)
                {
                    var valid = await _userManager.ConfirmEmailAsync(applicationUser, code);
                    if (valid.Succeeded)
                    {
                        this.ViewBag.emailConfirmed = true;
                    }
                }
            }
            else if (this.User.Identity != null && !string.IsNullOrEmpty(this.User.Identity.Name))
            {
                var user = await _userManager.FindByNameAsync(this.User.Identity.Name);
                var roles = await _userManager.GetRolesAsync(user);
                var userResult = new { User = new { DisplayName = user.UserName, Roles = roles.ToList() } };
                this.ViewBag.user = userResult;
            }

            return this.View();
        }

        // Becasue for production this is hashed chunk so has changes on each production build
        public async Task<string> GetMainDotJs()
        {
            var basePath = _env.WebRootPath + "//dist//";

            if (_env.IsDevelopment() && !System.IO.File.Exists(basePath + "main.js"))
            {
                // Just a .js request to make it wait to finish webpack dev middleware finish creating bundles:
                // More info here: https://github.com/aspnet/JavaScriptServices/issues/578#issuecomment-272039541
                using (var client = new HttpClient())
                {
                    var requestUri = this.Request.Scheme + "://" + this.Request.Host + "/dist/main.js";
                    await client.GetAsync(requestUri);
                }
            }

            var info = new System.IO.DirectoryInfo(basePath);
            var file = info.GetFiles().Where(f => f.Name.StartsWith("main.") && !f.Name.EndsWith("bundle.map"));
            return file.FirstOrDefault().Name;
        }

    }
}
