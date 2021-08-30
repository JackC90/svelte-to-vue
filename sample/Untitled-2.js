{
  type: "root",
  children: [
    {
      type: "svelteScript",
      tagName: "script",
      properties: [
      ],
      selfClosing: false,
      children: [
        {
          type: "text",
          value: "\n  // Svelte\n  import get from \"lodash.get\";\n  import { onMount } from \"svelte\";\n  import { object, string } from \"yup\";\n  import { _ } from \"svelte-i18n\";\n  import jwtDecode from \"jwt-decode\";\n\n  // Components\n  import Form from \"@cmpnts/Utility/Form/Form.svelte\";\n  import FormInput from \"@cmpnts/Utility/Form/FormInput.svelte\";\n  import PictureImage from \"@cmpnts/Utility/PictureImage/PictureImage.svelte\";\n  import FileInput from \"@cmpnts/Utility/Form/FileInput.svelte\";\n  import ResetPassword from \"@cmpnts/User/ResetPassword.svelte\";\n  import Spinner from \"@cmpnts/Library/Spinner.svelte\";\n  import InfoLayerTemplate from \"@cmpnts/Info/Utility/InfoLayerTemplate.svelte\";\n\n  // Stores && Utils\n  import { userAccount, logout } from \"@stores/userAccount.js\";\n  import { stringToBoolean } from \"@utils/string.js\";\n  import config from \"@utils/config.js\";\n  import { getInitialValues, formatOptions } from \"@utils/form.js\";\n  import { setHeaderParams } from \"@utils/apollo.js\";\n\n  // GraphQL\n  import { GET_USER_OPTS, UPDATE_USER } from \"@graphql/userAccount.js\";\n  import { getClient, query, mutate } from \"svelte-apollo\";\n\n  const { isDemo } = config;\n  const client = getClient();\n\n  $: id = get($userAccount, \"id\");\n  $: isLoggedIn = get($userAccount, \"isLoggedIn\");\n  $: email = get($userAccount, \"email\");\n\n  export let hasClose = true;\n  export let onClose;\n  export let token = null;\n\n  let userId;\n  $: {\n    let decoded = token ? jwtDecode(token) : null;\n    userId = get($userAccount, \"id\") || (decoded ? decoded.id : null);\n  }\n  let userData = {};\n  let initialValues;\n  let isLoading = true;\n  let avatar;\n  let popUp = null;\n\n  let isOpenResetPwd = false;\n  const toggleResetPwd = boolean => {\n    isOpenResetPwd =\n      boolean != null ? stringToBoolean(boolean) : !isOpenResetPwd;\n  };\n\n  let items = [\n    {\n      name: \"nickName\",\n      placeholder: $_(\"form.name.placeholder\"),\n      label: $_(\"form.name.label\")\n    },\n    {\n      name: \"email\",\n      label: $_(\"form.email.label\"),\n      placeholder: $_(\"form.email.placeholder\"),\n      type: \"email\",\n      disabled: true\n    },\n    {\n      name: \"password\",\n      label: $_(\"form.password.label\"),\n      placeholder: \"********\",\n      type: \"password\",\n      disabled: true\n    },\n    {\n      name: \"ceaNumber\",\n      label: $_(\"form.ceaNumber.label\")\n    }\n  ];\n\n  let schema = object().shape({\n    nickName: string().default(\"\").label($_(\"form.name.placeholder\")),\n    email: string()\n      .default(\"\")\n      .label($_(\"form.email.label\"))\n      .email($_(\"form.email.invalid\")),\n    password: string(),\n    ceaNumber: string()\n  });\n\n  onMount(async () => {\n    isLoading = false;\n\n    try {\n      if (email) {\n        isLoading = true;\n        const result = await query(client, {\n          query: GET_USER_OPTS,\n          variables: {\n            email\n          },\n          ...setHeaderParams(\"user\")\n        }).result();\n        userData = get(result, \"data.user\") || {};\n        initialValues = {\n          ...getInitialValues(userData, items),\n          ceaNumber: get(userData, \"detail.ceaNumber\")\n        };\n        avatar = userData.avatar;\n        isLoading = false;\n      }\n    } catch (e) {\n      Rollbar.error(e);\n      userData = null;\n      isLoading = false;\n    }\n  });\n\n  const onChangeAvatar = async (files, name) => {\n    if (files && get(files, \"[0]\")) {\n      const file = files[0];\n      const res = await mutate(client, {\n        mutation: UPDATE_USER,\n        variables: {\n          id: userId,\n          patch: {\n            avatar: file\n          }\n        },\n        ...setHeaderParams(\"user\")\n      });\n      const resAvatar = get(res, \"data.updateUser.user.avatar\");\n      if (resAvatar) {\n        popUp = $_(\"user.profileupdated\");\n        avatar = resAvatar;\n      }\n    }\n  };\n\n  const submit = async params => {\n    const {\n      detail: { values, setSubmitting, resetForm }\n    } = params;\n    try {\n      setSubmitting(true);\n      const { nickName, ceaNumber } = values;\n      const res = await client.mutate({\n        mutation: UPDATE_USER,\n        variables: {\n          id,\n          patch: {\n            nickName\n          },\n          detail: {\n            ceaNumber\n          }\n        },\n        ...setHeaderParams(\"user\")\n      });\n      const userRes = get(res, \"data.updateUser.user\");\n      userData = userRes;\n      userAccount.update(oldValues => {\n        return {\n          ...oldValues,\n          nickName: get(userData, \"nickName\"),\n          country: get(userData, \"country\"),\n          language: get(userData, \"language\")\n        };\n      });\n      setSubmitting(false);\n      popUp = $_(\"user.profileupdated\");\n    } catch (e) {\n      setSubmitting(false);\n    }\n  };\n\n  const handleLogout = () => {\n    logout(client);\n    onClose();\n  };\n",
        },
      ],
    },
    {
      type: "text",
      value: "\n\n",
    },
    {
      type: "svelteComponent",
      tagName: "InfoLayerTemplate",
      properties: [
        {
          type: "svelteProperty",
          name: "hasClose",
          value: [
            {
              type: "svelteDynamicContent",
              expression: {
                type: "svelteExpression",
                value: "hasClose",
              },
            },
          ],
          modifiers: [
          ],
          shorthand: "expression",
        },
        {
          type: "svelteProperty",
          name: "class",
          value: [
            {
              type: "svelteDynamicContent",
              expression: {
                type: "svelteExpression",
                value: "`right-0 bg-primary ${hasClose ? '' : 'w-full'}`",
              },
            },
          ],
          modifiers: [
          ],
          shorthand: "none",
        },
        {
          type: "svelteProperty",
          name: "classHeader",
          value: [
            {
              type: "text",
              value: "border-b",
            },
            {
              type: "text",
              value: " ",
            },
            {
              type: "text",
              value: "border-fade-gray",
            },
            {
              type: "text",
              value: " ",
            },
            {
              type: "text",
              value: "bg-primary",
            },
            {
              type: "text",
              value: " ",
            },
            {
              type: "text",
              value: "text-white",
            },
          ],
          modifiers: [
          ],
          shorthand: "none",
        },
        {
          type: "svelteProperty",
          name: "onClose",
          value: [
            {
              type: "svelteDynamicContent",
              expression: {
                type: "svelteExpression",
                value: "() => onClose()",
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
          value: "\n  ",
        },
        {
          type: "svelteElement",
          tagName: "div",
          properties: [
            {
              type: "svelteProperty",
              name: "slot",
              value: [
                {
                  type: "text",
                  value: "content-full",
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
              name: "if",
              branches: [
                {
                  type: "svelteBranch",
                  name: "if",
                  expression: {
                    type: "svelteExpression",
                    value: "popUp",
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
                              value: "inset-0",
                            },
                            {
                              type: "text",
                              value: " ",
                            },
                            {
                              type: "text",
                              value: "z-50",
                            },
                            {
                              type: "text",
                              value: " ",
                            },
                            {
                              type: "text",
                              value: "bg-black",
                            },
                            {
                              type: "text",
                              value: " ",
                            },
                            {
                              type: "text",
                              value: "opacity-50",
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
                              value: "inset-0",
                            },
                            {
                              type: "text",
                              value: " ",
                            },
                            {
                              type: "text",
                              value: "z-50",
                            },
                            {
                              type: "text",
                              value: " ",
                            },
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
                              value: "items-center",
                            },
                            {
                              type: "text",
                              value: " ",
                            },
                            {
                              type: "text",
                              value: "justify-center",
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
                          tagName: "div",
                          properties: [
                            {
                              type: "svelteProperty",
                              name: "class",
                              value: [
                                {
                                  type: "text",
                                  value: "w-3/4",
                                },
                                {
                                  type: "text",
                                  value: " ",
                                },
                                {
                                  type: "text",
                                  value: "overflow-y-auto",
                                },
                                {
                                  type: "text",
                                  value: " ",
                                },
                                {
                                  type: "text",
                                  value: "bg-white",
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
                                  value: "shadow-around",
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
                                  type: "text",
                                  value: "max-width:400px;",
                                },
                                {
                                  type: "text",
                                  value: " ",
                                },
                                {
                                  type: "text",
                                  value: "max-height:80vh;",
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
                              value: "\n          ",
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
                                      value: "flex-col",
                                    },
                                    {
                                      type: "text",
                                      value: " ",
                                    },
                                    {
                                      type: "text",
                                      value: "m-20px",
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
                                          value: "flex",
                                        },
                                        {
                                          type: "text",
                                          value: " ",
                                        },
                                        {
                                          type: "text",
                                          value: "justify-end",
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
                                      value: "\n              ",
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
                                              type: "text",
                                              value: "cursor-pointer",
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
                                                value: "() => (popUp = null)",
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
                                          value: "\n                ",
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
                                                  value: "/assets/utility/close-gray-big.svg",
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
                                                  value: "Close",
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
                                          value: "\n              ",
                                        },
                                      ],
                                    },
                                    {
                                      type: "text",
                                      value: "\n            ",
                                    },
                                  ],
                                },
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
                                          value: "flex",
                                        },
                                        {
                                          type: "text",
                                          value: " ",
                                        },
                                        {
                                          type: "text",
                                          value: "flex-col",
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
                                          value: "w-full",
                                        },
                                        {
                                          type: "text",
                                          value: " ",
                                        },
                                        {
                                          type: "text",
                                          value: "h-150px",
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
                                      value: "\n              ",
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
                                              value: "text-center",
                                            },
                                            {
                                              type: "text",
                                              value: " ",
                                            },
                                            {
                                              type: "text",
                                              value: "title-1",
                                            },
                                            {
                                              type: "text",
                                              value: " ",
                                            },
                                            {
                                              type: "text",
                                              value: "text-primary",
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
                                          type: "svelteDynamicContent",
                                          expression: {
                                            type: "svelteExpression",
                                            value: "popUp",
                                          },
                                        },
                                      ],
                                    },
                                    {
                                      type: "text",
                                      value: "\n            ",
                                    },
                                  ],
                                },
                                {
                                  type: "text",
                                  value: "\n          ",
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
          type: "svelteElement",
          tagName: "span",
          properties: [
            {
              type: "svelteProperty",
              name: "slot",
              value: [
                {
                  type: "text",
                  value: "header",
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
              type: "svelteDynamicContent",
              expression: {
                type: "svelteExpression",
                value: "$_('user.profile')",
              },
            },
          ],
        },
        {
          type: "text",
          value: "\n\n  ",
        },
        {
          type: "svelteElement",
          tagName: "div",
          properties: [
            {
              type: "svelteProperty",
              name: "slot",
              value: [
                {
                  type: "text",
                  value: "content",
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
                  value: "m-20px",
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
              type: "svelteComponent",
              tagName: "FileInput",
              properties: [
                {
                  type: "svelteProperty",
                  name: "name",
                  value: [
                    {
                      type: "text",
                      value: "avatar",
                    },
                  ],
                  modifiers: [
                  ],
                  shorthand: "none",
                },
                {
                  type: "svelteProperty",
                  name: "multiple",
                  value: [
                    {
                      type: "svelteDynamicContent",
                      expression: {
                        type: "svelteExpression",
                        value: "false",
                      },
                    },
                  ],
                  modifiers: [
                  ],
                  shorthand: "none",
                },
                {
                  type: "svelteProperty",
                  name: "onChange",
                  value: [
                    {
                      type: "svelteDynamicContent",
                      expression: {
                        type: "svelteExpression",
                        value: "onChangeAvatar",
                      },
                    },
                  ],
                  modifiers: [
                  ],
                  shorthand: "none",
                },
                {
                  type: "svelteProperty",
                  name: "accept",
                  value: [
                    {
                      type: "text",
                      value: "image/*",
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
                      name: "slot",
                      value: [
                        {
                          type: "text",
                          value: "label",
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
                      type: "svelteComponent",
                      tagName: "PictureImage",
                      properties: [
                        {
                          type: "svelteProperty",
                          name: "variant",
                          value: [
                            {
                              type: "text",
                              value: "round",
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
                              value: "w-90px",
                            },
                            {
                              type: "text",
                              value: " ",
                            },
                            {
                              type: "text",
                              value: "h-90px",
                            },
                            {
                              type: "text",
                              value: " ",
                            },
                            {
                              type: "text",
                              value: "shadow-under-md-fade",
                            },
                            {
                              type: "text",
                              value: " ",
                            },
                            {
                              type: "text",
                              value: "btn",
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
                              value: "user-image",
                            },
                          ],
                          modifiers: [
                          ],
                          shorthand: "none",
                        },
                        {
                          type: "svelteProperty",
                          name: "fallbackSrc",
                          value: [
                            {
                              type: "text",
                              value: "/assets/userIcons/default-profile-icon.svg",
                            },
                          ],
                          modifiers: [
                          ],
                          shorthand: "none",
                        },
                        {
                          type: "svelteProperty",
                          name: "src",
                          value: [
                            {
                              type: "svelteDynamicContent",
                              expression: {
                                type: "svelteExpression",
                                value: "avatar || '/assets/userIcons/default-profile-icon.svg'",
                              },
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
            {
              type: "text",
              value: "\n\n    ",
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
                    value: "isLoading",
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
                              value: "w-full",
                            },
                            {
                              type: "text",
                              value: " ",
                            },
                            {
                              type: "text",
                              value: "h-150px",
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
                          type: "svelteComponent",
                          tagName: "Spinner",
                          properties: [
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
                {
                  type: "svelteBranch",
                  name: "else if",
                  expression: {
                    type: "svelteExpression",
                    value: "isLoggedIn && userData && userData.id === id && initialValues",
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
                          value: "\n        ",
                        },
                        {
                          type: "svelteComponent",
                          tagName: "Form",
                          properties: [
                            {
                              type: "svelteProperty",
                              name: "schema",
                              value: [
                                {
                                  type: "svelteDynamicContent",
                                  expression: {
                                    type: "svelteExpression",
                                    value: "schema",
                                  },
                                },
                              ],
                              modifiers: [
                              ],
                              shorthand: "expression",
                            },
                            {
                              type: "svelteDirective",
                              name: "on",
                              value: [
                                {
                                  type: "svelteDynamicContent",
                                  expression: {
                                    type: "svelteExpression",
                                    value: "submit",
                                  },
                                },
                              ],
                              modifiers: [
                              ],
                              shorthand: "none",
                              specifier: "submit",
                            },
                            {
                              type: "svelteDirective",
                              name: "let",
                              value: [
                              ],
                              modifiers: [
                              ],
                              shorthand: "none",
                              specifier: "isSubmitting",
                            },
                            {
                              type: "svelteDirective",
                              name: "let",
                              value: [
                              ],
                              modifiers: [
                              ],
                              shorthand: "none",
                              specifier: "isValid",
                            },
                            {
                              type: "svelteDirective",
                              name: "let",
                              value: [
                              ],
                              modifiers: [
                              ],
                              shorthand: "none",
                              specifier: "isDisabledBtn",
                            },
                            {
                              type: "svelteProperty",
                              name: "initialValues",
                              value: [
                                {
                                  type: "svelteDynamicContent",
                                  expression: {
                                    type: "svelteExpression",
                                    value: "initialValues",
                                  },
                                },
                              ],
                              modifiers: [
                              ],
                              shorthand: "expression",
                            },
                          ],
                          selfClosing: false,
                          children: [
                            {
                              type: "text",
                              value: "\n          ",
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
                                      value: "body-3",
                                    },
                                    {
                                      type: "text",
                                      value: " ",
                                    },
                                    {
                                      type: "text",
                                      value: "text-fade-gray",
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
                                  value: "\n            ",
                                },
                                {
                                  type: "svelteDynamicContent",
                                  expression: {
                                    type: "svelteExpression",
                                    value: "$_('user.personalinformation')",
                                  },
                                },
                                {
                                  type: "text",
                                  value: "\n          ",
                                },
                              ],
                            },
                            {
                              type: "text",
                              value: "\n          ",
                            },
                            {
                              type: "svelteElement",
                              tagName: "hr",
                              properties: [
                                {
                                  type: "svelteProperty",
                                  name: "class",
                                  value: [
                                    {
                                      type: "text",
                                      value: "border-b",
                                    },
                                    {
                                      type: "text",
                                      value: " ",
                                    },
                                    {
                                      type: "text",
                                      value: "border-fade-gray",
                                    },
                                    {
                                      type: "text",
                                      value: " ",
                                    },
                                    {
                                      type: "text",
                                      value: "my-5px",
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
                            {
                              type: "svelteBranchingBlock",
                              name: "each",
                              branches: [
                                {
                                  type: "svelteBranch",
                                  name: "each",
                                  expression: {
                                    type: "svelteExpression",
                                    value: "items as item (item.name)",
                                  },
                                  children: [
                                    {
                                      type: "text",
                                      value: "\n            ",
                                    },
                                    {
                                      type: "svelteComponent",
                                      tagName: "FormInput",
                                      properties: [
                                        {
                                          type: "svelteProperty",
                                          name: "...item",
                                          value: [
                                            {
                                              type: "svelteDynamicContent",
                                              expression: {
                                                type: "svelteExpression",
                                                value: "...item",
                                              },
                                            },
                                          ],
                                          modifiers: [
                                          ],
                                          shorthand: "expression",
                                        },
                                        {
                                          type: "svelteProperty",
                                          name: "layout",
                                          value: [
                                            {
                                              type: "text",
                                              value: "inline",
                                            },
                                          ],
                                          modifiers: [
                                          ],
                                          shorthand: "none",
                                        },
                                        {
                                          type: "svelteProperty",
                                          name: "classInputWrapper",
                                          value: [
                                            {
                                              type: "svelteDynamicContent",
                                              expression: {
                                                type: "svelteExpression",
                                                value: "'text-white body-3 mb-10px'",
                                              },
                                            },
                                          ],
                                          modifiers: [
                                          ],
                                          shorthand: "none",
                                        },
                                        {
                                          type: "svelteProperty",
                                          name: "classLabel",
                                          value: [
                                            {
                                              type: "svelteDynamicContent",
                                              expression: {
                                                type: "svelteExpression",
                                                value: "'text-fade-gray mr-20px body-4'",
                                              },
                                            },
                                          ],
                                          modifiers: [
                                          ],
                                          shorthand: "none",
                                        },
                                        {
                                          type: "svelteProperty",
                                          name: "initialValue",
                                          value: [
                                            {
                                              type: "svelteDynamicContent",
                                              expression: {
                                                type: "svelteExpression",
                                                value: "get(initialValues, item.name)",
                                              },
                                            },
                                          ],
                                          modifiers: [
                                          ],
                                          shorthand: "none",
                                        },
                                        {
                                          type: "svelteProperty",
                                          name: "disabled",
                                          value: [
                                            {
                                              type: "svelteDynamicContent",
                                              expression: {
                                                type: "svelteExpression",
                                                value: "item.disabled != null ? item.disabled : isSubmitting || isDemo || isLoading",
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
                                          value: "\n              ",
                                        },
                                        {
                                          type: "svelteElement",
                                          tagName: "div",
                                          properties: [
                                            {
                                              type: "svelteProperty",
                                              name: "slot",
                                              value: [
                                                {
                                                  type: "text",
                                                  value: "action",
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
                                                  type: "svelteDynamicContent",
                                                  expression: {
                                                    type: "svelteExpression",
                                                    value: "`${item.name === 'password' ? 'btn absolute top-0 right-0 w-full h-full text-white text-right text-sm' : ''}`",
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
                                                    value: "() => {\n                  if (item.name === 'password') {\n                    toggleResetPwd(true);\n                  }\n                }",
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
                                              value: "\n                ",
                                            },
                                            {
                                              type: "svelteDynamicContent",
                                              expression: {
                                                type: "svelteExpression",
                                                value: "item.name === 'password' ? $_('cta.change') : ''",
                                              },
                                            },
                                            {
                                              type: "text",
                                              value: "\n              ",
                                            },
                                          ],
                                        },
                                        {
                                          type: "text",
                                          value: "\n            ",
                                        },
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
                              value: "\n\n          ",
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
                                        value: "`w-full btn py-15px px-20px my-20px rounded-15px border body-2 ${isDisabledBtn || isDemo ? 'border-fade-gray text-fade-gray bg-primary' : 'bg-white text-primary'}`",
                                      },
                                    },
                                  ],
                                  modifiers: [
                                  ],
                                  shorthand: "none",
                                },
                                {
                                  type: "svelteProperty",
                                  name: "type",
                                  value: [
                                    {
                                      type: "text",
                                      value: "submit",
                                    },
                                  ],
                                  modifiers: [
                                  ],
                                  shorthand: "none",
                                },
                                {
                                  type: "svelteProperty",
                                  name: "disabled",
                                  value: [
                                    {
                                      type: "svelteDynamicContent",
                                      expression: {
                                        type: "svelteExpression",
                                        value: "isDisabledBtn || isDemo",
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
                                  value: "\n            ",
                                },
                                {
                                  type: "svelteDynamicContent",
                                  expression: {
                                    type: "svelteExpression",
                                    value: "$_('user.saveprofile')",
                                  },
                                },
                                {
                                  type: "text",
                                  value: "\n          ",
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
              value: "\n\n    ",
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
                      value: "w-full",
                    },
                    {
                      type: "text",
                      value: " ",
                    },
                    {
                      type: "text",
                      value: "text-center",
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
                      value: "my-20px",
                    },
                    {
                      type: "text",
                      value: " ",
                    },
                    {
                      type: "text",
                      value: "text-fade-gray",
                    },
                    {
                      type: "text",
                      value: " ",
                    },
                    {
                      type: "text",
                      value: "hover:underline",
                    },
                    {
                      type: "text",
                      value: " ",
                    },
                    {
                      type: "text",
                      value: "body-3",
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
                        value: "handleLogout",
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
                  value: "\n      ",
                },
                {
                  type: "svelteDynamicContent",
                  expression: {
                    type: "svelteExpression",
                    value: "$_('user.signout')",
                  },
                },
                {
                  type: "text",
                  value: "\n    ",
                },
              ],
            },
            {
              type: "text",
              value: "\n\n    ",
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
                    value: "isOpenResetPwd",
                  },
                  children: [
                    {
                      type: "text",
                      value: "\n      ",
                    },
                    {
                      type: "svelteComponent",
                      tagName: "ResetPassword",
                      properties: [
                        {
                          type: "svelteProperty",
                          name: "onClose",
                          value: [
                            {
                              type: "svelteDynamicContent",
                              expression: {
                                type: "svelteExpression",
                                value: "() => toggleResetPwd(false)",
                              },
                            },
                          ],
                          modifiers: [
                          ],
                          shorthand: "none",
                        },
                        {
                          type: "svelteProperty",
                          name: "onSuccess",
                          value: [
                            {
                              type: "svelteDynamicContent",
                              expression: {
                                type: "svelteExpression",
                                value: "() => {\n          isOpenResetPwd = false;\n          popUp = $_('form.password.passwordupdated');\n        }",
                              },
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
          value: "\n",
        },
      ],
    },
  ],
}