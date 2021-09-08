<template>
  <!--   [X]  -->

  <div
    :class="`sticky top-0 z-50 w-full bg-white shadow-md px-20px flex ${
      $isLg ? 'justify-between' : 'items-center justify-between'
    }`"
    :clientHeight="$topBarHeight"
  >
    <template v-if="$isLg">
      <div class="flex items-center">
        <a class="button-simple" href="/">
          <img
            src="/assets/8prop/8prop-icon-horizontal.svg"
            alt="8prop"
            class="h-30px"
          />
        </a>

        <div class="flex items-center h-full mx-20px">
          <template v-for="section in menu">
            <template v-for="sectionItem in section">
              <template
                v-if="
                  !sectionItem.hideDesktop &&
                  (showHiddenFeatures || !sectionItem.isHidden)
                "
              >
                <a
                  :href="sectionItem.href"
                  :class="`button-simple mr-10px ${
                    getRouteName($location) === sectionItem.href
                      ? 'text-primary title-4'
                      : 'text-fade-gray body-4'
                  }`"
                  v-if="sectionItem.href"
                >
                  {{ sectionItem.label }}
                </a>

                <InputSelect
                  :items="sectionItem.items"
                  class="h-full mr-10px"
                  classInputWrapperContainer="h-full"
                  classInputWrapper="h-full"
                  classInput="h-full items-center"
                  classInputSelect="bg-primary"
                  layout="relative"
                  :arrow="false"
                  :empty="true"
                  :onChange="null"
                >
                  <div class="text-fade-gray body-4">
                    {{ sectionItem.label }}
                  </div>

                  <template #select-item="{ item, i }"
                    ><a :href="item.href">
                      <div class="text-white m-10px button-simple">
                        {{ $_(item.label) }}
                        <template v-if="i !== sectionItem.items.length - 1">
                          <hr class="divider-primary-white my-10px" />
                        </template>
                      </div> </a
                  ></template>
                </InputSelect>
              </template>
            </template>
          </template>
        </div>

        <button
          @click="() => installApp()"
          class="button-primary-outline body-4 px-10px py-2.5px"
          v-if="showInstall"
        >
          {{ $_("install.installourwebapp") }}
        </button>
      </div>

      <div class="flex items-center">
        <InputSelect
          :items="languages"
          :initialValue="languages.find((element) => element.id === $locale)"
          :onChange="(value) => onChangeLang(value.value)"
          class="h-full mr-20px"
          classInputWrapperContainer="h-full"
          classInputWrapper="h-full"
          classInput="h-full items-center"
          classInputSelect="bg-primary"
          layout="relative"
          :arrow="false"
        >
          <template #selected-item="{ item }"
            ><div class="flex items-center h-full text-primary body-4">
              {{ $_(item.label) }}
              <div class="border-b-2px border-primary">
                <img src="/assets/topBar/language.svg" alt="language" />
              </div></div
          ></template>

          <template #select-item="{ item, i }"
            ><div class="text-white m-10px button-simple">
              {{ $_(item.label) }}
              <template v-if="i !== languages.length - 1">
                <hr class="divider-primary-white my-10px" />
              </template></div
          ></template>
        </InputSelect>

        <div class="text-gray-400 body-4 ml-20px">v{{ version }}</div>
      </div> </template
    ><template v-else>
      <button
        @click="() => navigate(getAppendQsRoute({ menu: true }))"
        class="button-simple menu-button"
      >
        <img src="/assets/topBar/menu-blue.svg" alt="logo" />
      </button>

      <a class="button-simple" href="/">
        <img
          src="/assets/8prop/8prop-beta-icon-horizontal.svg"
          alt="logo"
          class="h-30px"
        />
      </a>

      <template v-if="getRouteName($location) !== '/'">
        <div />
      </template>
      <button
        @click="() => navigate(getAppendQsRoute({ search: null }))"
        class="button-simple menu-button-close"
        v-else-if="getQsParams($location).search"
      >
        <img src="/assets/utility/close-blue-big.svg" alt="logo" />
      </button>

      <button
        @click="() => navigate(getAppendQsRoute({ search: true }))"
        class="button-simple menu-button-search"
      >
        <img src="/assets/utility/search-blue.svg" alt="search" />
      </button>
    </template>
  </div>

  <div
    class="
      menu-mobile
      bg-fade-blue
      overflow-auto
      fixed
      py-20px
      z-50
      w-full
      inset-y-0
      transition-all
      flex flex-col
      justify-between
      getQsParams($location).menu
      ?
      'left-0'
      :
      '-left-1'
    "
    v-if="!$isLg"
  >
    <div>
      <div class="flex justify-between mr-20px">
        <div
          class="flex items-center mx-20px"
          v-if="!get($userAccount, 'isLoggedIn')"
        >
          <img
            src="/assets/8prop/8prop-icon.svg"
            alt="8prop"
            class="mr-20px h-50px w-50px"
          />
          <div>
            <div class="title-2 text-primary">{{ $_("user.welcome") }}</div>
            <button
              class="button-primary fine-prints-2 px-20px py-5px"
              @click="
                () =>
                  navigate(
                    getAppendQsRoute({
                      auth: true,
                      menu: null,
                    })
                  )
              "
            >
              {{ $_("user.signinregister") }}
            </button>
          </div>
        </div>

        <div
          class="flex items-center  rounded-r-15px px-20px py-10px mr-20px bg-primary"
          @click="
            () =>
              navigate(
                getAppendQsRoute({
                  profile: true,
                  menu: null,
                })
              )
          "
        >
          <PictureImage
            variant="round"
            alt="user-image"
            class="w-50px h-50px mr-20px"
            fallbackSrc="/assets/userIcons/default-profile-icon.svg"
            :src="
              get($userAccount, 'avatar') ||
              '/assets/userIcons/default-profile-icon.svg'
            "
          />
          <div>
            <div class="text-white body-2">
              {{ get($userAccount, "nickName") }}
            </div>
            <div class="text-white fine-prints-2">
              {{ $_("user.viewprofile") }}
            </div>
          </div>
        </div>

        <div
          @click="() => navigate(getAppendQsRoute({ menu: null }))"
          class="btn"
        >
          <img src="/assets/utility/close-gray-big.svg" alt="logo" />
        </div>
      </div>

      <div class="mx-20px">
        <hr class="divider-fade-gray mt-20px mb-10px" />

        <InputSelect
          :items="languages"
          :initialValue="languages.find((element) => element.id === $locale)"
          class="m-10px"
          :onChange="(value) => onChangeLang(value.value)"
        >
          <template #selected-item="{ item }"
            ><div class="flex items-center body-3 text-primary">
              <img
                src="/assets/topBar/language.svg"
                class="w-40px h-40px mr-20px"
                alt="language"
              />
              {{ $_(item.label) }}
            </div></template
          >

          <template #select-item="{ item }"
            ><div class="ml-60px mb-10px body-3 text-primary">
              {{ $_(item.label) }}
            </div></template
          >
        </InputSelect>

        <template v-for="section in menu">
          <hr class="divider-fade-gray my-10px" />
          <template v-for="item in section">
            <template
              v-if="!item.hideMobile && (showHiddenFeatures || !item.isHidden)"
            >
              <a
                :href="item.href"
                class="flex items-center btn m-10px body-3 text-primary"
                v-if="item.href"
              >
                <img :src="item.src" :alt="item.alt" class="mr-20px" />
                <div>{{ item.label }}</div>
              </a>

              <InputSelect
                :items="item.items"
                class="m-10px"
                :empty="true"
                :onChange="null"
              >
                <div class="flex items-center body-3 text-primary">
                  <img
                    :src="item.src"
                    class="w-40px h-40px mr-20px"
                    :alt="item.label"
                  />
                  {{ item.label }}
                </div>

                <template #select-item="{ item }"
                  ><a :href="item.href">
                    <div class="ml-60px mb-10px body-3 text-primary">
                      {{ $_(item.label) }}
                    </div>
                  </a></template
                >
              </InputSelect>
            </template>
          </template>
        </template>
      </div>
    </div>

    <div class="text-center body-4 text-primary mt-20px">v{{ version }}</div>
  </div>

  <div
    class="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between bg-white  shadow-above p-20px install"
    v-if="!$isLg && showInstall"
  >
    <button
      @click="
        () => {
          showInstall = false;
          setStorage('app', 'install', false);
        }
      "
      class="button-simple install-button-close"
    >
      <img src="/assets/utility/close-blue-big.svg" alt="Close" />
    </button>
    <div class="px-20px text-primary install-content">
      <h1 class="title-2 install-title">
        {{ $_("install.installourwebapp") }}
      </h1>
      <p class="body-3 install-text">
        {{ $_("install.havepropeasilyaccessible") }}
      </p>
    </div>
    <button
      @click="() => installApp()"
      class="button-primary title-3 install-button px-20px py-5px"
    >
      {{ $_("cta.install") }}
    </button>
  </div>
</template>

<script>
import { defineComponent, ref, toRefs } from "@nuxtjs/composition-api";
import get from "lodash.get";
import { _, locale } from "svelte-i18n";
import { navigate, useLocation } from "svelte-navigator";
import { isLg, topBarHeight } from "@stores/layout.js";
import { userAccount } from "@stores/userAccount.js";
import { setupI18n, languages } from "@services/i18n.js";
import { getAppendQsRoute, getRouteName, getQsParams } from "@stores/router.js";
import { checkStorage, setStorage } from "@utils/storage.js";
import { isSafari, isIos, isRunningStandalone } from "@utils/browser.js";
import config from "@utils/config.js";
import PictureImage from "@cmpnts/Utility/PictureImage/PictureImage.svelte";
import InputSelect from "@cmpnts/Library/Form/InputSelect.svelte";

export default defineComponent({
  props: {
    onSwitchLang: { type: Function, default: () => {} },
  },
  setup(props) {
    const { onSwitchLang } = toRefs(props);
    const location = useLocation();
    const version = config.version || "";
    const { showHiddenFeatures } = config;

    const menu = computed([
      [
        {
          label: $_("menu.map"),
          href: "/",
          src: "/assets/topBar/map.svg",
          alt: "map",
          hideDesktop: true,
        },
        {
          label: $_("menu.listings"),
          href: "/?tab=listing&listings=true",
          src: "/assets/topBar/listings.svg",
          alt: "listing",
        },
        {
          label: $_("menu.toolsservices"),
          src: "/assets/topBar/toolsservices.svg",
          alt: "toolsservices",
          items: [
            {
              label: "menu.xpert",
              href: "/xpert",
              src: "/assets/topBar/map.svg",
              alt: "xpert",
            },
            {
              label: "menu.360",
              href: "/360",
              src: "/assets/topBar/map.svg",
              alt: "360",
            },
          ],
        },
        {
          label: $_("menu.scheduler"),
          href: "/",
          src: "/assets/topBar/scheduler.svg",
          alt: "scheduler",
          isHidden: true,
          hideDesktop: true,
        },
        {
          label: $_("menu.bookmark"),
          href: "/",
          src: "/assets/topBar/bookmark.svg",
          alt: "bookmark",
          isHidden: true,
          hideDesktop: true,
        },
        {
          label: $_("menu.dataexplorer"),
          href: "/explorer",
          src: "/assets/topBar/dataexplorer.svg",
          alt: "dataexplorer",
          isHidden: true,
        },
      ],
      [
        {
          label: $_("menu.newsinsights"),
          href: "/insights",
          src: "/assets/topBar/newsinsights.svg",
          alt: "insights",
        },
      ],
      [
        {
          label: $_("menu.aboutthecompany"),
          src: "/assets/topBar/about.svg",
          alt: "about",
          items: [
            {
              label: $_("menu.about"),
              href: "/about",
            },
            {
              label: $_("menu.valuations"),
              href: "/automated-valuations",
            },
            {
              label: $_("menu.faqs"),
              href: "/faqs",
            },
          ],
        },
        {
          label: $_("menu.legalprivacy"),
          href: "/termsofuse",
          src: "/assets/topBar/legalprivacy.svg",
          alt: "legalprivacy",
          hideDesktop: true,
        },
      ],
    ]);
    const deferredPrompt = ref();
    const showInstall = ref(false);

    function handleInstall(e) {
      e.preventDefault();
      deferredPrompt.value = e;
      setTimeout(() => {
        showInstall.value =
          !checkStorage("app", "install") &&
          !isRunningStandalone() &&
          !isIos() &&
          !isSafari();
      }, 1000);
    }

    function installApp() {
      deferredPrompt.value.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          showInstall.value = false;
        }
        setStorage("app", "install", true);
        deferredPrompt.value = null;
      });
    }

    const onChangeLang = (newValue) => {
      setupI18n({ withLocale: newValue });
      onSwitchLang.value(newValue);
    };

    return {
      location,
      version,
      showHiddenFeatures,
      onSwitchLang,
      menu,
      deferredPrompt,
      showInstall,
      handleInstall,
      installApp,
      onChangeLang,
    };
  },
});
</script>
