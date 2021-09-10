<template>
  <!--   [X]  -->

  <window @beforeinstallprompt="handleInstall" />

  <div
    :class="`sticky top-0 z-50 w-full bg-white shadow-md px-20px flex ${
      $isLg ? 'justify-between' : 'items-center justify-between'
    }`"
    :clientHeight="$topBarHeight"
  ></div>
</template>

<script>
import {
  defineComponent,
  ref,
  toRefs,
  useStore,
  useContext,
} from "@nuxtjs/composition-api";
import PictureImage from "@/components/Utility/PictureImage/PictureImage.vue";
import InputSelect from "@/components/Library/Form/InputSelect.vue";

export default defineComponent({
  props: {
    onSwitchLang: { type: Function, default: () => {} },
  },
  setup(props) {
    const { storage, browser, config } = useContext();
    const { checkStorage, setStorage } = storage;
    const { isSafari, isIos, isRunningStandalone } = browser;
    const { onSwitchLang } = toRefs(props);
    const location = useLocation();
    const version = config.version || "";
    const { showHiddenFeatures } = config;

    const menu = computed(() => [
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
      deferredPrompt.userChoice.then(choiceResult => {
        if (choiceResult.outcome === "accepted") {
          showInstall.value = false;
        }
        setStorage("app", "install", true);
        deferredPrompt.value = null;
      });
    }

    const onChangeLang = newValue => {
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
