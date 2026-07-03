import { Link as TiptapLink } from "@tiptap/extension-link";
import { mergeAttributes } from "@tiptap/core";

/**
 * Custom Link extension with SEO-correct rel attributes.
 * Adds nofollow by default and supports rel & target attributes.
 */
export const Link = TiptapLink.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      rel: {
        default: "nofollow",
        parseHTML: (element) => element.getAttribute("rel"),
        renderHTML: (attributes) => ({
          rel: attributes.rel || "nofollow",
        }),
      },
      target: {
        default: null,
        parseHTML: (element) => element.getAttribute("target"),
        renderHTML: (attributes) => {
          if (!attributes.target) return {};
          return { target: attributes.target };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "a",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
});
