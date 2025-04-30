(function () {
  document.querySelectorAll("*").forEach((elem) => {
    if (elem.shadowRoot) {
      elem.shadowRoot.querySelectorAll("link").forEach((link_tag) => {
        if (
          link_tag.rel == "stylesheet" &&
          (!link_tag.sheet || link_tag.sheet.cssRules.length == 0)
        ) {
          // Extract the fragment from the link tag's href attribute.
          const url = new URL(link_tag.href);
          const fragment = url.hash.substring(1);
          if (fragment.length > 0) {
            // Look up the corresponding <style> with said href.
            let style_tag = document.getElementById(fragment);
            if (style_tag && style_tag.sheet) {
              let css_rule_string = "";
              for (let i = 0; i < style_tag.sheet.rules.length; ++i) {
                css_rule_string += style_tag.sheet.rules[i].cssText + "\n";
              }
              // Update the link tag with a dataURI with the style rules.
              link_tag.setAttribute(
                "href",
                "data:text/css;base64," + btoa(css_rule_string)
              );
            }
          }
        }
      });
    }
  });
})();
