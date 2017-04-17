using System;
using System.Net;
using System.Threading.Tasks;
using EchoIsles.Server.Entities;
using EchoIsles.Server.Extensions;
using EchoIsles.Server.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace EchoIsles.Server.Controllers.api
{
    [Route("api/[controller]")]
    public class ProfileController : BaseController
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger _logger;

        public ProfileController(ILoggerFactory loggerFactory, UserManager<ApplicationUser> userManager)
        {
            _logger = loggerFactory.CreateLogger<ProfileController>();
            _userManager = userManager;
        }

        [HttpGet("username")]
        public async Task<IActionResult> MeGet()
        {
            try
            {

                var user = await _userManager.FindByEmailAsync(this.HttpContext.User.Identity.Name);
                if (user != null)
                {
                    return this.Ok(new { FirstName = user.FirstName, LastName = user.LastName });
                }
                this.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                return this.Json(this.ModelState.GetModelErrors());
            }
            catch (Exception ex)
            {
                _logger.LogError(1, ex, "Unable to get profile of user");
                return this.BadRequest();
            }

        }

        [HttpPost("username")]
        public async Task<IActionResult> MePost([FromBody]UserNameViewModel model)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(this.HttpContext.User.Identity.Name);
                if (user != null)
                {
                    user.FirstName = model.FirstName;
                    user.LastName = model.LastName;
                    var result = await _userManager.UpdateAsync(user);
                    if (result == IdentityResult.Success)
                    {
                        return this.Ok(new { FirstName = model.FirstName, LastName = model.LastName });
                    }
                    this.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    return this.Json("Unable to update user");
                }
                this.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                return this.Json(this.ModelState.GetModelErrors());
            }
            catch (Exception ex)
            {
                _logger.LogError(1, ex, "Unable to save user name");

                return this.BadRequest();
            }

        }
        [HttpPost("changepassword")]
        public async Task<IActionResult> ChangePassword([FromBody]ChangePasswordVm model)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(this.HttpContext.User.Identity.Name);
                if (user != null)
                {
                    var result = await _userManager.ChangePasswordAsync(user, model.OldPassword, model.NewPassword);
                    if (result == IdentityResult.Success)
                    {
                        return this.Ok(new { });
                    }
                }
                this.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                return this.Json(new[] { "Unable to change password" });
            }
            catch (Exception ex)
            {
                _logger.LogError(1, ex, "Unable to change password");
                return this.BadRequest();
            }

        }
    }

}
