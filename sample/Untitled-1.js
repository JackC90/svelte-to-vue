{
  type: "root",
  children: [
    {
      type: "comment",
      value: " DOCUMENTATION: https://www.notion.so/Carousel-f6a4647e3811477cb2169dde834a1d61 ",
    },
    {
      type: "text",
      value: "\n",
    },
    {
      type: "svelteScript",
      tagName: "script",
      properties: [
      ],
      selfClosing: false,
      children: [
        {
          type: "text",
          value: "\n  // Svelte\n  import { _ } from \"svelte-i18n\";\n\n  export let items = [];\n  export let startIndex = 0;\n  export let autoplay = 0;\n  export let loop = false;\n  export let dots = false;\n  export let controls = false;\n  export let total = false;\n  let className = \"\";\n  export { className as class };\n  export let onChange = () => {};\n  let activeIndex = startIndex;\n  let carouselWidth = 0;\n  let intervalCarousel;\n\n  let goTo = index => {\n    if (index > items.length - 1) {\n      activeIndex = 0;\n    } else if (index < 0) {\n      activeIndex = items.length - 1;\n    } else {\n      activeIndex = index;\n    }\n    onChange(activeIndex);\n  };\n\n  $: {\n    if (autoplay !== 0 && !intervalCarousel) {\n      intervalCarousel = setInterval(() => {\n        goTo(activeIndex + 1);\n      }, autoplay);\n    }\n  }\n",
        },
      ],
    },
    {
      type: "text",
      value: "\n\n",
    },
    {
      type: "svelteElement",
      tagName: "div",
      properties: [
        {
          type: "svelteProperty",
          name: "class",
          value: [
            {
              type: "svelteDynamicContent",
              expression: {
                type: "svelteExpression",
                value: "`relative w-full overflow-hidden ${className}`",
              },
            },
          ],
          modifiers: [
          ],
          shorthand: "none",
        },
        {
          type: "svelteDirective",
          name: "bind",
          value: [
            {
              type: "svelteDynamicContent",
              expression: {
                type: "svelteExpression",
                value: "carouselWidth",
              },
            },
          ],
          modifiers: [
          ],
          shorthand: "none",
          specifier: "clientWidth",
        },
      ],
      selfClosing: false,
      children: [
        {
          type: "text",
          value: "\n  ",
        },
        {
          type: "svelteElement",
          tagName: "div",
          properties: [
            {
              type: "svelteProperty",
              name: "class",
              value: [
                {
                  type: "text",
                  value: "flex",
                },
                {
                  type: "text",
                  value: " ",
                },
                {
                  type: "text",
                  value: "h-full",
                },
                {
                  type: "text",
                  value: " ",
                },
                {
                  type: "text",
                  value: "transition",
                },
                {
                  type: "text",
                  value: " ",
                },
                {
                  type: "text",
                  value: "duration-500",
                },
                {
                  type: "text",
                  value: " ",
                },
                {
                  type: "text",
                  value: "ease-in-out",
                },
              ],
              modifiers: [
              ],
              shorthand: "none",
            },
            {
              type: "svelteProperty",
              name: "style",
              value: [
                {
                  type: "svelteDynamicContent",
                  expression: {
                    type: "svelteExpression",
                    value: "`width: ${carouselWidth * items.length - 1}px; transform: translateX(-${carouselWidth * activeIndex}px);`",
                  },
                },
              ],
              modifiers: [
              ],
              shorthand: "none",
            },
          ],
          selfClosing: false,
          children: [
            {
              type: "text",
              value: "\n    ",
            },
            {
              type: "svelteBranchingBlock",
              name: "each",
              branches: [
                {
                  type: "svelteBranch",
                  name: "each",
                  expression: {
                    type: "svelteExpression",
                    value: "items as item, i",
                  },
                  children: [
                    {
                      type: "text",
                      value: "\n      ",
                    },
                    {
                      type: "svelteElement",
                      tagName: "div",
                      properties: [
                        {
                          type: "svelteProperty",
                          name: "class",
                          value: [
                            {
                              type: "text",
                              value: "h-full",
                            },
                          ],
                          modifiers: [
                          ],
                          shorthand: "none",
                        },
                        {
                          type: "svelteProperty",
                          name: "style",
                          value: [
                            {
                              type: "svelteDynamicContent",
                              expression: {
                                type: "svelteExpression",
                                value: "`width: ${carouselWidth}px;`",
                              },
                            },
                          ],
                          modifiers: [
                          ],
                          shorthand: "none",
                        },
                      ],
                      selfClosing: false,
                      children: [
                        {
                          type: "text",
                          value: "\n        ",
                        },
                        {
                          type: "svelteElement",
                          tagName: "slot",
                          properties: [
                            {
                              type: "svelteProperty",
                              name: "name",
                              value: [
                                {
                                  type: "text",
                                  value: "carousel-content",
                                },
                              ],
                              modifiers: [
                              ],
                              shorthand: "none",
                            },
                            {
                              type: "svelteProperty",
                              name: "item",
                              value: [
                                {
                                  type: "svelteDynamicContent",
                                  expression: {
                                    type: "svelteExpression",
                                    value: "item",
                                  },
                                },
                              ],
                              modifiers: [
                              ],
                              shorthand: "expression",
                            },
                          ],
                          selfClosing: true,
                          children: [
                          ],
                        },
                        {
                          type: "text",
                          value: "\n      ",
                        },
                      ],
                    },
                    {
                      type: "text",
                      value: "\n    ",
                    },
                  ],
                },
              ],
            },
            {
              type: "text",
              value: "\n  ",
            },
          ],
        },
        {
          type: "text",
          value: "\n\n  ",
        },
        {
          type: "svelteBranchingBlock",
          name: "if",
          branches: [
            {
              type: "svelteBranch",
              name: "if",
              expression: {
                type: "svelteExpression",
                value: "dots",
              },
              children: [
                {
                  type: "text",
                  value: "\n    ",
                },
                {
                  type: "svelteElement",
                  tagName: "div",
                  properties: [
                    {
                      type: "svelteProperty",
                      name: "class",
                      value: [
                        {
                          type: "text",
                          value: "flex",
                        },
                        {
                          type: "text",
                          value: " ",
                        },
                        {
                          type: "text",
                          value: "justify-center",
                        },
                        {
                          type: "text",
                          value: " ",
                        },
                        {
                          type: "text",
                          value: "mt-20px",
                        },
                      ],
                      modifiers: [
                      ],
                      shorthand: "none",
                    },
                  ],
                  selfClosing: false,
                  children: [
                    {
                      type: "text",
                      value: "\n      ",
                    },
                    {
                      type: "svelteBranchingBlock",
                      name: "each",
                      branches: [
                        {
                          type: "svelteBranch",
                          name: "each",
                          expression: {
                            type: "svelteExpression",
                            value: "items as item, i",
                          },
                          children: [
                            {
                              type: "text",
                              value: "\n        ",
                            },
                            {
                              type: "svelteElement",
                              tagName: "button",
                              properties: [
                                {
                                  type: "svelteProperty",
                                  name: "class",
                                  value: [
                                    {
                                      type: "svelteDynamicContent",
                                      expression: {
                                        type: "svelteExpression",
                                        value: "`hover:opacity-75 ${i === activeIndex ? '' : 'opacity-50'}`",
                                      },
                                    },
                                  ],
                                  modifiers: [
                                  ],
                                  shorthand: "none",
                                },
                                {
                                  type: "svelteDirective",
                                  name: "on",
                                  value: [
                                    {
                                      type: "svelteDynamicContent",
                                      expression: {
                                        type: "svelteExpression",
                                        value: "() => goTo(i)",
                                      },
                                    },
                                  ],
                                  modifiers: [
                                  ],
                                  shorthand: "none",
                                  specifier: "click",
                                },
                              ],
                              selfClosing: false,
                              children: [
                                {
                                  type: "text",
                                  value: "\n          ",
                                },
                                {
                                  type: "svelteBranchingBlock",
                                  name: "if",
                                  branches: [
                                    {
                                      type: "svelteBranch",
                                      name: "if",
                                      expression: {
                                        type: "svelteExpression",
                                        value: "$$slots[`carousel-dots`]",
                                      },
                                      children: [
                                        {
                                          type: "text",
                                          value: "\n            ",
                                        },
                                        {
                                          type: "svelteElement",
                                          tagName: "slot",
                                          properties: [
                                            {
                                              type: "svelteProperty",
                                              name: "name",
                                              value: [
                                                {
                                                  type: "text",
                                                  value: "carousel-dots",
                                                },
                                              ],
                                              modifiers: [
                                              ],
                                              shorthand: "none",
                                            },
                                          ],
                                          selfClosing: true,
                                          children: [
                                          ],
                                        },
                                        {
                                          type: "text",
                                          value: "\n          ",
                                        },
                                      ],
                                    },
                                    {
                                      type: "svelteBranch",
                                      name: "else",
                                      expression: {
                                        type: "svelteExpression",
                                        value: "",
                                      },
                                      children: [
                                        {
                                          type: "text",
                                          value: "\n            ",
                                        },
                                        {
                                          type: "svelteElement",
                                          tagName: "div",
                                          properties: [
                                            {
                                              type: "svelteProperty",
                                              name: "class",
                                              value: [
                                                {
                                                  type: "text",
                                                  value: "rounded-full",
                                                },
                                                {
                                                  type: "text",
                                                  value: " ",
                                                },
                                                {
                                                  type: "text",
                                                  value: "btn",
                                                },
                                                {
                                                  type: "text",
                                                  value: " ",
                                                },
                                                {
                                                  type: "text",
                                                  value: "w-10px",
                                                },
                                                {
                                                  type: "text",
                                                  value: " ",
                                                },
                                                {
                                                  type: "text",
                                                  value: "h-10px",
                                                },
                                                {
                                                  type: "text",
                                                  value: " ",
                                                },
                                                {
                                                  type: "text",
                                                  value: "mx-10px",
                                                },
                                                {
                                                  type: "text",
                                                  value: " ",
                                                },
                                                {
                                                  type: "text",
                                                  value: "bg-primary",
                                                },
                                              ],
                                              modifiers: [
                                              ],
                                              shorthand: "none",
                                            },
                                          ],
                                          selfClosing: true,
                                          children: [
                                          ],
                                        },
                                        {
                                          type: "text",
                                          value: "\n          ",
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  type: "text",
                                  value: "\n        ",
                                },
                              ],
                            },
                            {
                              type: "text",
                              value: "\n      ",
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: "text",
                      value: "\n    ",
                    },
                  ],
                },
                {
                  type: "text",
                  value: "\n  ",
                },
              ],
            },
          ],
        },
        {
          type: "text",
          value: "\n\n  ",
        },
        {
          type: "svelteBranchingBlock",
          name: "if",
          branches: [
            {
              type: "svelteBranch",
              name: "if",
              expression: {
                type: "svelteExpression",
                value: "controls",
              },
              children: [
                {
                  type: "text",
                  value: "\n    ",
                },
                {
                  type: "svelteBranchingBlock",
                  name: "if",
                  branches: [
                    {
                      type: "svelteBranch",
                      name: "if",
                      expression: {
                        type: "svelteExpression",
                        value: "activeIndex !== 0 || loop",
                      },
                      children: [
                        {
                          type: "text",
                          value: "\n      ",
                        },
                        {
                          type: "svelteElement",
                          tagName: "div",
                          properties: [
                            {
                              type: "svelteProperty",
                              name: "class",
                              value: [
                                {
                                  type: "text",
                                  value: "absolute",
                                },
                                {
                                  type: "text",
                                  value: " ",
                                },
                                {
                                  type: "text",
                                  value: "left-0",
                                },
                                {
                                  type: "text",
                                  value: " ",
                                },
                                {
                                  type: "text",
                                  value: "bg-transparent-black",
                                },
                                {
                                  type: "text",
                                  value: " ",
                                },
                                {
                                  type: "text",
                                  value: "top-1/2",
                                },
                                {
                                  type: "text",
                                  value: " ",
                                },
                                {
                                  type: "text",
                                  value: "hover:opacity-75",
                                },
                                {
                                  type: "text",
                                  value: " ",
                                },
                                {
                                  type: "text",
                                  value: "mx-20px",
                                },
                              ],
                              modifiers: [
                              ],
                              shorthand: "none",
                            },
                            {
                              type: "svelteDirective",
                              name: "on",
                              value: [
                                {
                                  type: "svelteDynamicContent",
                                  expression: {
                                    type: "svelteExpression",
                                    value: "() => goTo(activeIndex - 1)",
                                  },
                                },
                              ],
                              modifiers: [
                              ],
                              shorthand: "none",
                              specifier: "click",
                            },
                          ],
                          selfClosing: false,
                          children: [
                            {
                              type: "text",
                              value: "\n        ",
                            },
                            {
                              type: "svelteElement",
                              tagName: "img",
                              properties: [
                                {
                                  type: "svelteProperty",
                                  name: "src",
                                  value: [
                                    {
                                      type: "text",
                                      value: "/assets/utility/arrow-down-white-big.svg",
                                    },
                                  ],
                                  modifiers: [
                                  ],
                                  shorthand: "none",
                                },
                                {
                                  type: "svelteProperty",
                                  name: "alt",
                                  value: [
                                    {
                                      type: "text",
                                      value: "arrow",
                                    },
                                  ],
                                  modifiers: [
                                  ],
                                  shorthand: "none",
                                },
                                {
                                  type: "svelteProperty",
                                  name: "class",
                                  value: [
                                    {
                                      type: "text",
                                      value: "transform",
                                    },
                                    {
                                      type: "text",
                                      value: " ",
                                    },
                                    {
                                      type: "text",
                                      value: "rotate-90",
                                    },
                                  ],
                                  modifiers: [
                                  ],
                                  shorthand: "none",
                                },
                              ],
                              selfClosing: true,
                              children: [
                              ],
                            },
                            {
                              type: "text",
                              value: "\n      ",
                            },
                          ],
                        },
                        {
                          type: "text",
                          value: "\n    ",
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "text",
                  value: "\n    ",
                },
                {
                  type: "svelteBranchingBlock",
                  name: "if",
                  branches: [
                    {
                      type: "svelteBranch",
                      name: "if",
                      expression: {
                        type: "svelteExpression",
                        value: "activeIndex !== items.length - 1 || loop",
                      },
                      children: [
                        {
                          type: "text",
                          value: "\n      ",
                        },
                        {
                          type: "svelteElement",
                          tagName: "div",
                          properties: [
                            {
                              type: "svelteProperty",
                              name: "class",
                              value: [
                                {
                                  type: "text",
                                  value: "absolute",
                                },
                                {
                                  type: "text",
                                  value: " ",
                                },
                                {
                                  type: "text",
                                  value: "right-0",
                                },
                                {
                                  type: "text",
                                  value: " ",
                                },
                                {
                                  type: "text",
                                  value: "bg-transparent-black",
                                },
                                {
                                  type: "text",
                                  value: " ",
                                },
                                {
                                  type: "text",
                                  value: "top-1/2",
                                },
                                {
                                  type: "text",
                                  value: " ",
                                },
                                {
                                  type: "text",
                                  value: "hover:opacity-75",
                                },
                                {
                                  type: "text",
                                  value: " ",
                                },
                                {
                                  type: "text",
                                  value: "mx-20px",
                                },
                              ],
                              modifiers: [
                              ],
                              shorthand: "none",
                            },
                            {
                              type: "svelteDirective",
                              name: "on",
                              value: [
                                {
                                  type: "svelteDynamicContent",
                                  expression: {
                                    type: "svelteExpression",
                                    value: "() => goTo(activeIndex + 1)",
                                  },
                                },
                              ],
                              modifiers: [
                              ],
                              shorthand: "none",
                              specifier: "click",
                            },
                          ],
                          selfClosing: false,
                          children: [
                            {
                              type: "text",
                              value: "\n        ",
                            },
                            {
                              type: "svelteElement",
                              tagName: "img",
                              properties: [
                                {
                                  type: "svelteProperty",
                                  name: "src",
                                  value: [
                                    {
                                      type: "text",
                                      value: "/assets/utility/arrow-down-white-big.svg",
                                    },
                                  ],
                                  modifiers: [
                                  ],
                                  shorthand: "none",
                                },
                                {
                                  type: "svelteProperty",
                                  name: "alt",
                                  value: [
                                    {
                                      type: "text",
                                      value: "arrow",
                                    },
                                  ],
                                  modifiers: [
                                  ],
                                  shorthand: "none",
                                },
                                {
                                  type: "svelteProperty",
                                  name: "class",
                                  value: [
                                    {
                                      type: "text",
                                      value: "transform",
                                    },
                                    {
                                      type: "text",
                                      value: " ",
                                    },
                                    {
                                      type: "text",
                                      value: "-rotate-90",
                                    },
                                  ],
                                  modifiers: [
                                  ],
                                  shorthand: "none",
                                },
                              ],
                              selfClosing: true,
                              children: [
                              ],
                            },
                            {
                              type: "text",
                              value: "\n      ",
                            },
                          ],
                        },
                        {
                          type: "text",
                          value: "\n    ",
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "text",
                  value: "\n  ",
                },
              ],
            },
          ],
        },
        {
          type: "text",
          value: "\n\n  ",
        },
        {
          type: "svelteBranchingBlock",
          name: "if",
          branches: [
            {
              type: "svelteBranch",
              name: "if",
              expression: {
                type: "svelteExpression",
                value: "total",
              },
              children: [
                {
                  type: "text",
                  value: "\n    ",
                },
                {
                  type: "svelteElement",
                  tagName: "div",
                  properties: [
                    {
                      type: "svelteProperty",
                      name: "class",
                      value: [
                        {
                          type: "text",
                          value: "absolute",
                        },
                        {
                          type: "text",
                          value: " ",
                        },
                        {
                          type: "text",
                          value: "bottom-0",
                        },
                        {
                          type: "text",
                          value: " ",
                        },
                        {
                          type: "text",
                          value: "left-1/2",
                        },
                        {
                          type: "text",
                          value: " ",
                        },
                        {
                          type: "text",
                          value: "my-20px",
                        },
                      ],
                      modifiers: [
                      ],
                      shorthand: "none",
                    },
                  ],
                  selfClosing: false,
                  children: [
                    {
                      type: "text",
                      value: "\n      ",
                    },
                    {
                      type: "svelteElement",
                      tagName: "div",
                      properties: [
                        {
                          type: "svelteProperty",
                          name: "class",
                          value: [
                            {
                              type: "text",
                              value: "relative",
                            },
                            {
                              type: "text",
                              value: " ",
                            },
                            {
                              type: "text",
                              value: "text-white",
                            },
                            {
                              type: "text",
                              value: " ",
                            },
                            {
                              type: "text",
                              value: "right-1/2",
                            },
                            {
                              type: "text",
                              value: " ",
                            },
                            {
                              type: "text",
                              value: "bg-transparent-black",
                            },
                            {
                              type: "text",
                              value: " ",
                            },
                            {
                              type: "text",
                              value: "rounded-15px",
                            },
                            {
                              type: "text",
                              value: " ",
                            },
                            {
                              type: "text",
                              value: "py-5px",
                            },
                            {
                              type: "text",
                              value: " ",
                            },
                            {
                              type: "text",
                              value: "px-10px",
                            },
                            {
                              type: "text",
                              value: " ",
                            },
                            {
                              type: "text",
                              value: "body-4",
                            },
                          ],
                          modifiers: [
                          ],
                          shorthand: "none",
                        },
                      ],
                      selfClosing: false,
                      children: [
                        {
                          type: "text",
                          value: "\n        ",
                        },
                        {
                          type: "svelteDynamicContent",
                          expression: {
                            type: "svelteExpression",
                            value: "$_('map.indexoftotal', {\n          values: { n: activeIndex + 1, total: items.length }\n        })",
                          },
                        },
                        {
                          type: "text",
                          value: "\n      ",
                        },
                      ],
                    },
                    {
                      type: "text",
                      value: "\n    ",
                    },
                  ],
                },
                {
                  type: "text",
                  value: "\n  ",
                },
              ],
            },
          ],
        },
        {
          type: "text",
          value: "\n",
        },
      ],
    },
  ],
}