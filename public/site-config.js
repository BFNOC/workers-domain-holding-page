window.SITE_CONFIG = {
  contactEmail: "hello@example.com",
  ownerName: "the owner",
  defaultLocale: "en",
  locales: ["en", "zh"],
  ui: {
    en: {
      availability: "Available by email",
      domainKicker: "About this domain",
      domainTitle: "{domain} may be transferred.",
      contactPrefix: "If you have a serious use for it, send a direct note to",
      contactSuffix: ".",
      footerOwner: "Maintained by {owner}.",
      footerHost: "Hosted on Cloudflare Workers.",
      mailSubject: "Inquiry regarding {domain}",
      mailBody: [
        "Hello, I am interested in {domain}.",
        "",
        "My initial thoughts / offer:",
        "",
        "Contact info:"
      ]
    },
    zh: {
      availability: "邮件联系",
      domainKicker: "关于这个域名",
      domainTitle: "{domain} 可以转让。",
      contactPrefix: "如果你有认真用途，可以直接发邮件到",
      contactSuffix: "。",
      footerOwner: "由 {owner} 维护。",
      footerHost: "托管在 Cloudflare Workers。",
      mailSubject: "关于 {domain} 的咨询",
      mailBody: [
        "你好，我对 {domain} 感兴趣。",
        "",
        "我的初步想法 / 报价：",
        "",
        "联系方式："
      ]
    }
  },
  previewDomain: "example.com",
  domainProfiles: {
    "example.com": {
      displayName: "example.com",
      visualSrc: "./assets/hero.jpg",
      content: {
        en: {
          pageTitle: "{domain}, a quiet place on the web",
          metaDescription: "A quiet personal holding page for a domain that may be available to the right buyer.",
          heroKicker: "Private holding page",
          heroTitle: "A quiet place for useful things.",
          heroLead: "I keep a bias for clean tools, long-lived projects, careful writing, and pages that do not rush to please everyone.",
          heroBody: "This is a temporary home for {domain}. It can remain quiet for now. It can also become something more precise when the right idea arrives.",
          visualAlt: "A quiet desk with a notebook, pen, and coffee.",
          visualCaption: "Notes, tools, small systems, and the patience to keep them useful.",
          note: "This domain is currently held for a quiet, long-term project. It may be available to the right buyer.",
          principles: [
            {
              title: "Tools with restraint",
              body: "Small surfaces, clear affordances, no unnecessary theatre."
            },
            {
              title: "Writing that holds up",
              body: "Plain language for complicated work, without performing certainty."
            },
            {
              title: "Projects with a long memory",
              body: "Things worth returning to, maintained beyond the first spark."
            }
          ]
        },
        zh: {
          pageTitle: "{domain}，一个安静的网页位置",
          metaDescription: "一个安静的个人域名保留页，等待合适的项目或买家。",
          heroKicker: "私人保留页",
          heroTitle: "给有用想法留一个安静位置。",
          heroLead: "我偏爱干净的工具、能长期维护的项目、认真写下来的文字，以及不急着讨好所有人的页面。",
          heroBody: "这里暂时是 {domain} 的家。它可以先保持安静，也可以在合适的想法出现时变得更具体。",
          visualAlt: "一张安静的桌面，上面有笔记本、笔和咖啡。",
          visualCaption: "笔记、工具、小系统，以及让它们长期有用的耐心。",
          note: "这个域名目前为长期项目保留；如果用途合适，也可以邮件沟通。",
          principles: [
            {
              title: "克制的工具",
              body: "小而清晰的界面，明确的动作，不添加无意义的戏剧感。"
            },
            {
              title: "经得起看的文字",
              body: "用朴素语言表达复杂工作，不表演确定性。"
            },
            {
              title: "有长期记忆的项目",
              body: "值得反复回来维护的东西，不止停在最初的灵感。"
            }
          ]
        }
      }
    }
  }
};
