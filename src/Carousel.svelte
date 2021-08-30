<!-- DOCUMENTATION: https://www.notion.so/Carousel-f6a4647e3811477cb2169dde834a1d61 -->
<script>
  // Svelte
  import { _ } from "svelte-i18n";

  export let items = [];
  export let startIndex = 0;
  export let autoplay = 0;
  export let loop = false;
  export let dots = false;
  export let controls = false;
  export let total = false;
  let className = "";
  export { className as class };
  export let onChange = () => {};
  let activeIndex = startIndex;
  let carouselWidth = 0;
  let intervalCarousel;

  let goTo = index => {
    if (index > items.length - 1) {
      activeIndex = 0;
    } else if (index < 0) {
      activeIndex = items.length - 1;
    } else {
      activeIndex = index;
    }
    onChange(activeIndex);
  };

  $: {
    if (autoplay !== 0 && !intervalCarousel) {
      intervalCarousel = setInterval(() => {
        goTo(activeIndex + 1);
      }, autoplay);
    }
  }
</script>

<div
  class={`relative w-full overflow-hidden ${className}`}
  bind:clientWidth={carouselWidth}>
  <div
    class="flex h-full transition duration-500 ease-in-out"
    style={`width: ${carouselWidth * items.length - 1}px; transform: translateX(-${carouselWidth * activeIndex}px);`}>
    {#each items as item, i}
      <div class="h-full" style={`width: ${carouselWidth}px;`}>
        <slot name="carousel-content" {item} />
      </div>
    {/each}
  </div>

  {#if dots}
    <div class="flex justify-center mt-20px">
      {#each items as item, i}
        <button
          class={`hover:opacity-75 ${i === activeIndex ? '' : 'opacity-50'}`}
          on:click={() => goTo(i)}>
          {#if $$slots[`carousel-dots`]}
            <slot name="carousel-dots" />
          {:else}
            <div class="rounded-full btn w-10px h-10px mx-10px bg-primary" />
          {/if}
        </button>
      {/each}
    </div>
  {/if}

  {#if controls}
    {#if activeIndex !== 0 || loop}
      <div
        class="absolute left-0 bg-transparent-black top-1/2 hover:opacity-75 mx-20px"
        on:click={() => goTo(activeIndex - 1)}>
        <img
          src="/assets/utility/arrow-down-white-big.svg"
          alt="arrow"
          class="transform rotate-90" />
      </div>
    {/if}
    {#if activeIndex !== items.length - 1 || loop}
      <div
        class="absolute right-0 bg-transparent-black top-1/2 hover:opacity-75 mx-20px"
        on:click={() => goTo(activeIndex + 1)}>
        <img
          src="/assets/utility/arrow-down-white-big.svg"
          alt="arrow"
          class="transform -rotate-90" />
      </div>
    {/if}
  {/if}

  {#if total}
    <div class="absolute bottom-0 left-1/2 my-20px">
      <div
        class="relative text-white right-1/2 bg-transparent-black rounded-15px py-5px px-10px body-4">
        {$_('map.indexoftotal', {
          values: { n: activeIndex + 1, total: items.length }
        })}
      </div>
    </div>
  {/if}
</div>
