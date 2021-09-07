<!-- [X] -->
<script>
  // Svelte
  import get from "lodash.get";
  import { _, locale } from "svelte-i18n";
  import { navigate, useLocation } from "svelte-navigator";

  const location = useLocation();

  // Utils & Stores
  import { isLg, topBarHeight } from "@stores/layout.js";
  import { userAccount } from "@stores/userAccount.js";
  import { setupI18n, languages } from "@services/i18n.js";
  import {
    getAppendQsRoute,
    getRouteName,
    getQsParams
  } from "@stores/router.js";
  import { checkStorage, setStorage } from "@utils/storage.js";
  import { isSafari, isIos, isRunningStandalone } from "@utils/browser.js";
  import config from "@utils/config.js";

  const version = config.version || "";

  // Components
  import PictureImage from "@cmpnts/Utility/PictureImage/PictureImage.svelte";
  import InputSelect from "@cmpnts/Library/Form/InputSelect.svelte";

  const { showHiddenFeatures } = config;

  export let onSwitchLang = () => {};

  $: menu = [
    [
      {
        label: $_("menu.map"),
        href: "/",
        src: "/assets/topBar/map.svg",
        alt: "map",
        hideDesktop: true
      },
      {
        label: $_("menu.listings"),
        href: "/?tab=listing&listings=true",
        src: "/assets/topBar/listings.svg",
        alt: "listing"
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
            alt: "xpert"
          },
          {
            label: "menu.360",
            href: "/360",
            src: "/assets/topBar/map.svg",
            alt: "360"
          }
        ]
      },
      {
        label: $_("menu.scheduler"),
        href: "/",
        src: "/assets/topBar/scheduler.svg",
        alt: "scheduler",
        isHidden: true,
        hideDesktop: true
      },
      {
        label: $_("menu.bookmark"),
        href: "/",
        src: "/assets/topBar/bookmark.svg",
        alt: "bookmark",
        isHidden: true,
        hideDesktop: true
      },
      {
        label: $_("menu.dataexplorer"),
        href: "/explorer",
        src: "/assets/topBar/dataexplorer.svg",
        alt: "dataexplorer",
        isHidden: true
      }
    ],
    [
      {
        label: $_("menu.newsinsights"),
        href: "/insights",
        src: "/assets/topBar/newsinsights.svg",
        alt: "insights"
      }
    ],
    [
      {
        label: $_("menu.aboutthecompany"),
        src: "/assets/topBar/about.svg",
        alt: "about",
        items: [
          {
            label: $_("menu.about"),
            href: "/about"
          },
          {
            label: $_("menu.valuations"),
            href: "/automated-valuations"
          },
          {
            label: $_("menu.faqs"),
            href: "/faqs"
          }
        ]
      },
      {
        label: $_("menu.legalprivacy"),
        href: "/termsofuse",
        src: "/assets/topBar/legalprivacy.svg",
        alt: "legalprivacy",
        hideDesktop: true
      }
    ]
  ];

  let deferredPrompt;
  let showInstall = false;

  function handleInstall(e) {
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(() => {
      showInstall =
        !checkStorage("app", "install") &&
        !isRunningStandalone() &&
        !isIos() &&
        !isSafari();
    }, 1000);
  }

  function installApp() {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choiceResult => {
      if (choiceResult.outcome === "accepted") {
        showInstall = false;
      }
      setStorage("app", "install", true);
      deferredPrompt = null;
    });
  }

  const onChangeLang = newValue => {
    setupI18n({ withLocale: newValue });
    onSwitchLang(newValue);
  };
</script>

<svelte:window on:beforeinstallprompt={handleInstall} />

<div
  class={`sticky top-0 z-50 w-full bg-white shadow-md px-20px flex ${$isLg ? 'justify-between' : 'items-center justify-between'}`}
  bind:clientHeight={$topBarHeight}>
  {#if $isLg}
    <div class="flex items-center">
      <a class="button-simple" href="/">
        <img
          src="/assets/8prop/8prop-icon-horizontal.svg"
          alt="8prop"
          class="h-30px" />
      </a>

      <div class="flex items-center h-full mx-20px">
        {#each menu as section}
          {#each section as sectionItem}
            {#if !sectionItem.hideDesktop && (showHiddenFeatures || !sectionItem.isHidden)}
              {#if sectionItem.href}
                <a
                  href={sectionItem.href}
                  class={`button-simple mr-10px ${getRouteName($location) === sectionItem.href ? 'text-primary title-4' : 'text-fade-gray body-4'}`}>
                  {sectionItem.label}
                </a>
              {:else}
                <InputSelect
                  items={sectionItem.items}
                  class="h-full mr-10px"
                  classInputWrapperContainer="h-full"
                  classInputWrapper="h-full"
                  classInput="h-full items-center"
                  classInputSelect="bg-primary"
                  layout="relative"
                  arrow={false}
                  empty={true}
                  onChange={null}>
                  <div class="text-fade-gray body-4" slot="selected-item">
                    {sectionItem.label}
                  </div>

                  <a let:item let:i href={item.href} slot="select-item">
                    <div class="text-white m-10px button-simple">
                      {$_(item.label)}
                      {#if i !== sectionItem.items.length - 1}
                        <hr class="divider-primary-white my-10px" />
                      {/if}
                    </div>
                  </a>
                </InputSelect>
              {/if}
            {/if}
          {/each}
        {/each}
      </div>

      {#if showInstall}
        <button
          on:click={() => installApp()}
          class="button-primary-outline body-4 px-10px py-2.5px">
          {$_('install.installourwebapp')}
        </button>
      {/if}
    </div>

    <div class="flex items-center">
      <InputSelect
        items={languages}
        initialValue={languages.find(element => element.id === $locale)}
        onChange={value => onChangeLang(value.value)}
        class="h-full mr-20px"
        classInputWrapperContainer="h-full"
        classInputWrapper="h-full"
        classInput="h-full items-center"
        classInputSelect="bg-primary"
        layout="relative"
        arrow={false}>
        <div
          class="flex items-center h-full text-primary body-4"
          slot="selected-item"
          let:item>
          {$_(item.label)}
          <div class="border-b-2px border-primary">
            <img src="/assets/topBar/language.svg" alt="language" />
          </div>
        </div>

        <div
          slot="select-item"
          class="text-white m-10px button-simple"
          let:item
          let:i>
          {$_(item.label)}
          {#if i !== languages.length - 1}
            <hr class="divider-primary-white my-10px" />
          {/if}
        </div>
      </InputSelect>

      {#key $userAccount}
        {#if get($userAccount, 'isLoggedIn')}
          <button
            class="flex items-center h-full button-simple text-primary body-4"
            on:click={() => navigate(getAppendQsRoute({ profile: true }))}>
            <div
              class="mr-10px"
              style="max-width:90px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
              {`${$_('user.hi') + (`, ${get($userAccount, 'nickName')}` || '')}`}
            </div>
            <div class="flex items-center h-full border-b-2px border-primary">
              <PictureImage
                variant="round"
                alt="user-image"
                class="w-30px h-30px"
                fallbackSrc="/assets/userIcons/default-profile-icon.svg"
                src={get($userAccount, 'avatar') || '/assets/userIcons/default-profile-icon.svg'} />
            </div>
          </button>
        {:else}
          <button
            class="button-primary-outline body-3 px-10px py-2.5px"
            on:click={() => navigate(getAppendQsRoute({
                  auth: true,
                  menu: null
                }))}>
            {$_('user.signin')}
          </button>
        {/if}
      {/key}

      <div class="text-gray-400 body-4 ml-20px">v{version}</div>
    </div>
  {:else}
    <button
      on:click={() => navigate(getAppendQsRoute({ menu: true }))}
      class="button-simple menu-button">
      <img src="/assets/topBar/menu-blue.svg" alt="logo" />
    </button>

    <a class="button-simple" href="/">
      <img
        src="/assets/8prop/8prop-beta-icon-horizontal.svg"
        alt="logo"
        class="h-30px" />
    </a>

    {#if getRouteName($location) !== '/'}
      <div />
    {:else if getQsParams($location).search}
      <button
        on:click={() => navigate(getAppendQsRoute({ search: null }))}
        class="button-simple menu-button-close">
        <img src="/assets/utility/close-blue-big.svg" alt="logo" />
      </button>
    {:else}
      <button
        on:click={() => navigate(getAppendQsRoute({ search: true }))}
        class="button-simple menu-button-search">
        <img src="/assets/utility/search-blue.svg" alt="search" />
      </button>
    {/if}
  {/if}
</div>

{#if !$isLg}
  <div
    class="menu-mobile bg-fade-blue overflow-auto fixed py-20px z-50 w-full inset-y-0 transition-all flex flex-col justify-between {getQsParams($location).menu ? 'left-0' : '-left-1'}">
    <div>
      <div class="flex justify-between mr-20px">
        {#if !get($userAccount, 'isLoggedIn')}
          <div class="flex items-center mx-20px">
            <img
              src="/assets/8prop/8prop-icon.svg"
              alt="8prop"
              class="mr-20px h-50px w-50px" />
            <div>
              <div class="title-2 text-primary">{$_('user.welcome')}</div>
              <button
                class="button-primary fine-prints-2 px-20px py-5px"
                on:click={() => navigate(getAppendQsRoute({
                      auth: true,
                      menu: null
                    }))}>{$_('user.signinregister')}</button>
            </div>
          </div>
        {:else}
          <div
            class="flex items-center rounded-r-15px px-20px py-10px mr-20px bg-primary"
            on:click={() => navigate(getAppendQsRoute({
                  profile: true,
                  menu: null
                }))}>
            <PictureImage
              variant="round"
              alt="user-image"
              class="w-50px h-50px mr-20px"
              fallbackSrc="/assets/userIcons/default-profile-icon.svg"
              src={get($userAccount, 'avatar') || '/assets/userIcons/default-profile-icon.svg'} />
            <div>
              <div class="text-white body-2">
                {get($userAccount, 'nickName')}
              </div>
              <div class="text-white fine-prints-2">
                {$_('user.viewprofile')}
              </div>
            </div>
          </div>
        {/if}

        <div
          on:click={() => navigate(getAppendQsRoute({ menu: null }))}
          class="btn">
          <img src="/assets/utility/close-gray-big.svg" alt="logo" />
        </div>
      </div>

      <div class="mx-20px">
        <hr class="divider-fade-gray mt-20px mb-10px" />

        <InputSelect
          items={languages}
          initialValue={languages.find(element => element.id === $locale)}
          class="m-10px"
          onChange={value => onChangeLang(value.value)}>
          <div
            class="flex items-center body-3 text-primary"
            slot="selected-item"
            let:item>
            <img
              src="/assets/topBar/language.svg"
              class="w-40px h-40px mr-20px"
              alt="language" />
            {$_(item.label)}
          </div>

          <div
            class="ml-60px mb-10px body-3 text-primary"
            slot="select-item"
            let:item>
            {$_(item.label)}
          </div>
        </InputSelect>

        {#each menu as section}
          <hr class="divider-fade-gray my-10px" />
          {#each section as item}
            {#if !item.hideMobile && (showHiddenFeatures || !item.isHidden)}
              {#if item.href}
                <a
                  href={item.href}
                  class="flex items-center btn m-10px body-3 text-primary">
                  <img src={item.src} alt={item.alt} class="mr-20px" />
                  <div>{item.label}</div>
                </a>
              {:else}
                <InputSelect
                  items={item.items}
                  class="m-10px"
                  empty={true}
                  onChange={null}>
                  <div
                    class="flex items-center body-3 text-primary"
                    slot="selected-item">
                    <img
                      src={item.src}
                      class="w-40px h-40px mr-20px"
                      alt={item.label} />
                    {item.label}
                  </div>

                  <a href={item.href} slot="select-item" let:item>
                    <div class="ml-60px mb-10px body-3 text-primary">
                      {$_(item.label)}
                    </div>
                  </a>
                </InputSelect>
              {/if}
            {/if}
          {/each}
        {/each}
      </div>
    </div>

    <div class="text-center body-4 text-primary mt-20px">v{version}</div>
  </div>
{/if}

{#if !$isLg && showInstall}
  <div
    class="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between bg-white shadow-above p-20px install">
    <button
      on:click={() => {
        showInstall = false;
        setStorage('app', 'install', false);
      }}
      class="button-simple install-button-close">
      <img src="/assets/utility/close-blue-big.svg" alt="Close" />
    </button>
    <div class="px-20px text-primary install-content">
      <h1 class="title-2 install-title">{$_('install.installourwebapp')}</h1>
      <p class="body-3 install-text">
        {$_('install.havepropeasilyaccessible')}
      </p>
    </div>
    <button
      on:click={() => installApp()}
      class="button-primary title-3 install-button px-20px py-5px">
      {$_('cta.install')}
    </button>
  </div>
{/if}
