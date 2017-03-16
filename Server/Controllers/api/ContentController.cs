using System.Linq;
using EchoIsles.Server.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EchoIsles.Server.Controllers.api
{
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class ContentController : BaseController
    {
        private readonly ApplicationDbContext _context;

        public ContentController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("languages")]
        public IActionResult Languages()
        {
            var langs = _context.Languages.ToList();

            return this.Ok(langs);
        }

        [HttpGet]
        public IActionResult Get(string lang)
        {
            var contentCacheKey = "ContentKey" + lang;
            var result = (from c in _context.Content
                          join t in _context.ContentText on c.Id equals t.ContentId
                          join l in _context.Languages on t.LanguageId equals l.Id
                          where l.Locale == lang
                          select new ContentVm
                          {
                              Key = c.Key,
                              Value = t.Text
                          }).ToDictionary(x => x.Key, x => x.Value);

            return this.Ok(result);
        }

        [HttpPost]
        [Route("update")]
        public IActionResult Post(ContentVm model)
        {
            var content = _context.Content.FirstOrDefault(c => c.Key == model.Key);
            if (content != null)
            {
                var contentText = _context.ContentText.FirstOrDefault(t => t.ContentId == content.Id);
                if (contentText != null)
                {
                    contentText.Text = model.Value;
                    _context.ContentText.Add(contentText);
                    _context.Entry(contentText).State = EntityState.Modified;
                    _context.SaveChanges();
                    return this.Ok(model);
                }

            }
            return this.BadRequest("Unable to update content");
        }



    }
}
