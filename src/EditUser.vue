<template>


<InfoLayerTemplate :hasClose="hasClose" :class="`right-0 bg-primary ${hasClose ? '' : 'w-full'}`" classHeader="border-b border-fade-gray bg-primary text-white" :onClose="() => onClose()">
  <div slot="content-full">
    <template v-if="popUp">
      <div class="absolute inset-0 z-50 bg-black opacity-50" />
      <div class="absolute inset-0 z-50 flex items-center justify-center">
        <div class="w-3/4 overflow-y-auto bg-white rounded-15px shadow-around" style="max-width:400px; max-height:80vh;">
          <div class="flex flex-col m-20px">
            <div class="flex justify-end">
              <button class="cursor-pointer" @click="() => (popUp = null)">
                <img src="/assets/utility/close-gray-big.svg" alt="Close" />
              </button>
            </div>
            <div class="flex flex-col justify-center w-full h-150px">
              <div class="text-center title-1 text-primary">{{ popUp }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <span slot="header">{{ $_('user.profile') }}</span>

  <div slot="content" class="m-20px">
    <FileInput name="avatar" :multiple="false" :onChange="onChangeAvatar" accept="image/*">
      <div slot="label" class="flex justify-center">
        <PictureImage variant="round" class="w-90px h-90px shadow-under-md-fade btn" alt="user-image" fallbackSrc="/assets/userIcons/default-profile-icon.svg" :src="avatar || '/assets/userIcons/default-profile-icon.svg'" />
      </div>
    </FileInput>

    <template v-if="isLoading">
      <div class="flex justify-center w-full h-150px">
        <Spinner />
      </div>
    </template><template v-else-if="isLoggedIn && userData && userData.id === id && initialValues">
      <div class="my-20px">
        <Form :schema="schema" @submit="submit" :initialValues="initialValues" #default="{ isSubmitting, isValid, isDisabledBtn }">
          <div class="body-3 text-fade-gray">
            {{ $_('user.personalinformation') }}
          </div>
          <hr class="border-b border-fade-gray my-5px" />
          <template v-for="item in items">
            <FormInput v-bind="item" layout="inline" :classInputWrapper="'text-white body-3 mb-10px'" :classLabel="'text-fade-gray mr-20px body-4'" :initialValue="get(initialValues, item.name)" :disabled="item.disabled != null ? item.disabled : isSubmitting || isDemo || isLoading" :key="item.name">
              <div slot="action" :class="`${item.name === 'password' ? 'btn absolute top-0 right-0 w-full h-full text-white text-right text-sm' : ''}`" @click="() => {
                  if (item.name === 'password') {
                    toggleResetPwd(true);
                  }
                }">
                {{ item.name === 'password' ? $_('cta.change') : '' }}
              </div>
            </FormInput>
          </template>

          <button :class="`w-full btn py-15px px-20px my-20px rounded-15px border body-2 ${isDisabledBtn || isDemo ? 'border-fade-gray text-fade-gray bg-primary' : 'bg-white text-primary'}`" type="submit" :disabled="isDisabledBtn || isDemo">
            {{ $_('user.saveprofile') }}
          </button>
        </Form>
      </div>
    </template>

    <div class="w-full text-center btn my-20px text-fade-gray hover:underline body-3" @click="handleLogout">
      {{ $_('user.signout') }}
    </div>

    <template v-if="isOpenResetPwd">
      <ResetPassword :onClose="() => toggleResetPwd(false)" :onSuccess="() => {
          isOpenResetPwd = false;
          popUp = $_('form.password.passwordupdated');
        }" />
    </template>
  </div>
</InfoLayerTemplate>
</template>

<script>
import { defineComponent, ref, reactive, toRefs } from '@nuxtjs/composition-api';
import get from "lodash.get";
import { onMount } from "svelte";
import { object, string } from "yup";
import { _ } from "svelte-i18n";
import jwtDecode from "jwt-decode";
import Form from "@cmpnts/Utility/Form/Form.svelte";
import FormInput from "@cmpnts/Utility/Form/FormInput.svelte";
import PictureImage from "@cmpnts/Utility/PictureImage/PictureImage.svelte";
import FileInput from "@cmpnts/Utility/Form/FileInput.svelte";
import ResetPassword from "@cmpnts/User/ResetPassword.svelte";
import Spinner from "@cmpnts/Library/Spinner.svelte";
import InfoLayerTemplate from "@cmpnts/Info/Utility/InfoLayerTemplate.svelte";
import { userAccount, logout } from "@stores/userAccount.js";
import { stringToBoolean } from "@utils/string.js";
import config from "@utils/config.js";
import { getInitialValues, formatOptions } from "@utils/form.js";
import { setHeaderParams } from "@utils/apollo.js";
import { GET_USER_OPTS, UPDATE_USER } from "@graphql/userAccount.js";
import { getClient, query, mutate } from "svelte-apollo";
export default defineComponent({

  setup(props) {
    const { hasClose, token } = toRefs(props);
    const { isDemo } = ref(config);
    const client = ref(getClient());
    const userData = ref({});
    const isLoading = ref(true);
    const popUp = ref(null);
    const isOpenResetPwd = ref(false);

    const toggleResetPwd = boolean => {
    isOpenResetPwd.value =
      boolean != null ? stringToBoolean(boolean) : !isOpenResetPwd.value;
  };

    onMounted(async () => {
    isLoading.value = false;
    try {
      if (email) {
        isLoading.value = true;
        const result = await query(client.value, {
          query: GET_USER_OPTS,
          variables: {
            email
          },
          ...setHeaderParams("user")
        }).result();
        userData.value = get(result, "data.user") || {};
        initialValues = {
          ...getInitialValues(userData.value, items),
          ceaNumber: get(userData.value, "detail.ceaNumber")
        };
        avatar = userData.value.avatar;
        isLoading.value = false;
      }
    } catch (e) {
      Rollbar.error(e);
      userData.value = null;
      isLoading.value = false;
    }
  });

    const onChangeAvatar = async (files, name) => {
    if (files && get(files, "[0]")) {
      const file = files[0];
      const res = await mutate(client.value, {
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
        popUp.value = $_("user.profileupdated");
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
      const res = await client.value.mutate({
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
      userData.value = userRes;
      userAccount.update(oldValues => {
        return {
          ...oldValues,
          nickName: get(userData.value, "nickName"),
          country: get(userData.value, "country"),
          language: get(userData.value, "language")
        };
      });
      setSubmitting(false);
      popUp.value = $_("user.profileupdated");
    } catch (e) {
      setSubmitting(false);
    }
  };

    const handleLogout = () => {
    logout(client.value);
    onClose();
  };
    return { { isDemo }, client, hasClose, token, userData, isLoading, popUp, isOpenResetPwd, toggleResetPwd, onChangeAvatar, submit, handleLogout }
  }
});
</script>