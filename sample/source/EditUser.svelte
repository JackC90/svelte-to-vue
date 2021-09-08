<script>
  // Svelte
  import get from "lodash.get";
  import { onMount } from "svelte";
  import { object, string } from "yup";
  import { _ } from "svelte-i18n";
  import jwtDecode from "jwt-decode";

  // Components
  import Form from "@cmpnts/Utility/Form/Form.svelte";
  import FormInput from "@cmpnts/Utility/Form/FormInput.svelte";
  import PictureImage from "@cmpnts/Utility/PictureImage/PictureImage.svelte";
  import FileInput from "@cmpnts/Utility/Form/FileInput.svelte";
  import ResetPassword from "@cmpnts/User/ResetPassword.svelte";
  import Spinner from "@cmpnts/Library/Spinner.svelte";
  import InfoLayerTemplate from "@cmpnts/Info/Utility/InfoLayerTemplate.svelte";

  // Stores && Utils
  import { userAccount, logout } from "@stores/userAccount.js";
  import { stringToBoolean } from "@utils/string.js";
  import config from "@utils/config.js";
  import { getInitialValues, formatOptions } from "@utils/form.js";
  import { setHeaderParams } from "@utils/apollo.js";

  // GraphQL
  import { GET_USER_OPTS, UPDATE_USER } from "@graphql/userAccount.js";
  import { getClient, query, mutate } from "svelte-apollo";

  const { isDemo } = config;
  const client = getClient();

  $: id = get($userAccount, "id");
  $: isLoggedIn = get($userAccount, "isLoggedIn");
  $: email = get($userAccount, "email");

  export let hasClose = true;
  export let onClose;
  export let token = null;

  let userId;
  $: {
    let decoded = token ? jwtDecode(token) : null;
    userId = get($userAccount, "id") || (decoded ? decoded.id : null);
  }
  let userData = {};
  let initialValues;
  let isLoading = true;
  let avatar;
  let popUp = null;

  let isOpenResetPwd = false;
  const toggleResetPwd = boolean => {
    isOpenResetPwd =
      boolean != null ? stringToBoolean(boolean) : !isOpenResetPwd;
  };

  let items = [
    {
      name: "nickName",
      placeholder: $_("form.name.placeholder"),
      label: $_("form.name.label")
    },
    {
      name: "email",
      label: $_("form.email.label"),
      placeholder: $_("form.email.placeholder"),
      type: "email",
      disabled: true
    },
    {
      name: "password",
      label: $_("form.password.label"),
      placeholder: "********",
      type: "password",
      disabled: true
    },
    {
      name: "ceaNumber",
      label: $_("form.ceaNumber.label")
    }
  ];

  let schema = object().shape({
    nickName: string().default("").label($_("form.name.placeholder")),
    email: string()
      .default("")
      .label($_("form.email.label"))
      .email($_("form.email.invalid")),
    password: string(),
    ceaNumber: string()
  });

  onMount(async () => {
    isLoading = false;

    try {
      if (email) {
        isLoading = true;
        const result = await query(client, {
          query: GET_USER_OPTS,
          variables: {
            email
          },
          ...setHeaderParams("user")
        }).result();
        userData = get(result, "data.user") || {};
        initialValues = {
          ...getInitialValues(userData, items),
          ceaNumber: get(userData, "detail.ceaNumber")
        };
        avatar = userData.avatar;
        isLoading = false;
      }
    } catch (e) {
      Rollbar.error(e);
      userData = null;
      isLoading = false;
    }
  });

  const onChangeAvatar = async (files, name) => {
    if (files && get(files, "[0]")) {
      const file = files[0];
      const res = await mutate(client, {
        mutation: UPDATE_USER,
        variables: {
          id: userId,
          patch: {
            avatar: file
          }
        },
        ...setHeaderParams("user")
      });
      const resAvatar = get(res, "data.updateUser.user.avatar");
      if (resAvatar) {
        popUp = $_("user.profileupdated");
        avatar = resAvatar;
      }
    }
  };

  const submit = async params => {
    const {
      detail: { values, setSubmitting, resetForm }
    } = params;
    try {
      setSubmitting(true);
      const { nickName, ceaNumber } = values;
      const res = await client.mutate({
        mutation: UPDATE_USER,
        variables: {
          id,
          patch: {
            nickName
          },
          detail: {
            ceaNumber
          }
        },
        ...setHeaderParams("user")
      });
      const userRes = get(res, "data.updateUser.user");
      userData = userRes;
      userAccount.update(oldValues => {
        return {
          ...oldValues,
          nickName: get(userData, "nickName"),
          country: get(userData, "country"),
          language: get(userData, "language")
        };
      });
      setSubmitting(false);
      popUp = $_("user.profileupdated");
    } catch (e) {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout(client);
    onClose();
  };
</script>

<InfoLayerTemplate
  {hasClose}
  class={`right-0 bg-primary ${hasClose ? '' : 'w-full'}`}
  classHeader="border-b border-fade-gray bg-primary text-white"
  onClose={() => onClose()}>
  <div slot="content-full">
    {#if popUp}
      <div class="absolute inset-0 z-50 bg-black opacity-50" />
      <div class="absolute inset-0 z-50 flex items-center justify-center">
        <div
          class="w-3/4 overflow-y-auto bg-white rounded-15px shadow-around"
          style="max-width:400px; max-height:80vh;">
          <div class="flex flex-col m-20px">
            <div class="flex justify-end">
              <button class="cursor-pointer" on:click={() => (popUp = null)}>
                <img src="/assets/utility/close-gray-big.svg" alt="Close" />
              </button>
            </div>
            <div class="flex flex-col justify-center w-full h-150px">
              <div class="text-center title-1 text-primary">{popUp}</div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <span slot="header">{$_('user.profile')}</span>

  <div slot="content" class="m-20px">
    <FileInput
      name="avatar"
      multiple={false}
      onChange={onChangeAvatar}
      accept="image/*">
      <div slot="label" class="flex justify-center">
        <PictureImage
          variant="round"
          class="w-90px h-90px shadow-under-md-fade btn"
          alt="user-image"
          fallbackSrc="/assets/userIcons/default-profile-icon.svg"
          src={avatar || '/assets/userIcons/default-profile-icon.svg'} />
      </div>
    </FileInput>

    {#if isLoading}
      <div class="flex justify-center w-full h-150px">
        <Spinner />
      </div>
    {:else if isLoggedIn && userData && userData.id === id && initialValues}
      <div class="my-20px">
        <Form
          {schema}
          on:submit={submit}
          let:isSubmitting
          let:isValid
          let:isDisabledBtn
          {initialValues}>
          <div class="body-3 text-fade-gray">
            {$_('user.personalinformation')}
          </div>
          <hr class="border-b border-fade-gray my-5px" />
          {#each items as item (item.name)}
            <FormInput
              {...item}
              layout="inline"
              classInputWrapper={'text-white body-3 mb-10px'}
              classLabel={'text-fade-gray mr-20px body-4'}
              initialValue={get(initialValues, item.name)}
              disabled={item.disabled != null ? item.disabled : isSubmitting || isDemo || isLoading}>
              <div
                slot="action"
                class={`${item.name === 'password' ? 'btn absolute top-0 right-0 w-full h-full text-white text-right text-sm' : ''}`}
                on:click={() => {
                  if (item.name === 'password') {
                    toggleResetPwd(true);
                  }
                }}>
                {item.name === 'password' ? $_('cta.change') : ''}
              </div>
            </FormInput>
          {/each}

          <button
            class={`w-full btn py-15px px-20px my-20px rounded-15px border body-2 ${isDisabledBtn || isDemo ? 'border-fade-gray text-fade-gray bg-primary' : 'bg-white text-primary'}`}
            type="submit"
            disabled={isDisabledBtn || isDemo}>
            {$_('user.saveprofile')}
          </button>
        </Form>
      </div>
    {/if}

    <div
      class="w-full text-center btn my-20px text-fade-gray hover:underline body-3"
      on:click={handleLogout}>
      {$_('user.signout')}
    </div>

    {#if isOpenResetPwd}
      <ResetPassword
        onClose={() => toggleResetPwd(false)}
        onSuccess={() => {
          isOpenResetPwd = false;
          popUp = $_('form.password.passwordupdated');
        }} />
    {/if}
  </div>
</InfoLayerTemplate>
