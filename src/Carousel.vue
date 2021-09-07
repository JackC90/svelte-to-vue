<template>
  <!--   DOCUMENTATION: https://www.notion.so/Carousel-f6a4647e3811477cb2169dde834a1d61  -->

  <div
    :class="`relative w-full overflow-hidden ${className}`"
    :clientWidth="carouselWidth"
  >
    <div
      class="flex h-full transition duration-500 ease-in-out"
      :style="`width: ${
        carouselWidth * items.length - 1
      }px; transform: translateX(-${carouselWidth * activeIndex}px);`"
    >
      <template v-for="(item, i) in items">
        <div class="h-full" :style="`width: ${carouselWidth}px;`" :key="i">
          <slot name="carousel-content" :item="item" />
        </div>
      </template>
    </div>

    <template v-if="dots">
      <div class="flex justify-center mt-20px">
        <template v-for="(item, i) in items">
          <button
            :class="`hover:opacity-75 ${i === activeIndex ? '' : 'opacity-50'}`"
            @click="() => goTo(i)"
            :key="i"
          >
            <template v-if="$$slots[`carousel-dots`]">
              <slot name="carousel-dots" /> </template
            ><template v-else>
              <div class="rounded-full btn w-10px h-10px mx-10px bg-primary" />
            </template>
          </button>
        </template>
      </div>
    </template>

    <template v-if="controls">
      <template v-if="activeIndex !== 0 || loop">
        <div
          class="absolute left-0  bg-transparent-black top-1/2 hover:opacity-75 mx-20px"
          @click="() => goTo(activeIndex - 1)"
        >
          <img
            src="/assets/utility/arrow-down-white-big.svg"
            alt="arrow"
            class="transform rotate-90"
          />
        </div>
      </template>
      <template v-if="activeIndex !== items.length - 1 || loop">
        <div
          class="absolute right-0  bg-transparent-black top-1/2 hover:opacity-75 mx-20px"
          @click="() => goTo(activeIndex + 1)"
        >
          <img
            src="/assets/utility/arrow-down-white-big.svg"
            alt="arrow"
            class="transform -rotate-90"
          />
        </div>
      </template>
    </template>

    <template v-if="total">
      <div class="absolute bottom-0 left-1/2 my-20px">
        <div
          class="relative text-white  right-1/2 bg-transparent-black rounded-15px py-5px px-10px body-4"
        >
          {{
            $_("map.indexoftotal", {
              values: { n: activeIndex + 1, total: items.length },
            })
          }}
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  reactive,
  toRefs,
} from "@nuxtjs/composition-api";
import { _ } from "svelte-i18n";
export default defineComponent({
  setup(props) {
    const {
      items,
      startIndex,
      autoplay,
      loop,
      dots,
      controls,
      total,
      onChange,
    } = toRefs(props);
    const className = ref("");
    const activeIndex = ref(startIndex);
    const carouselWidth = ref(0);
    const intervalCarousel = ref();

    let goTo = (index) => {
      if (index > items.value.length - 1) {
        activeIndex.value = 0;
      } else if (index < 0) {
        activeIndex.value = items.value.length - 1;
      } else {
        activeIndex.value = index;
      }
      onChange.value(activeIndex.value);
    };

    watchEffect(() => {
      {
        if (autoplay.value !== 0 && !intervalCarousel.value) {
          intervalCarousel.value = setInterval(() => {
            goTo(activeIndex.value + 1);
          }, autoplay.value);
        }
      }
    });

    return {
      items,
      startIndex,
      autoplay,
      loop,
      dots,
      controls,
      total,
      className,
      onChange,
      activeIndex,
      carouselWidth,
      intervalCarousel,
      goTo,
    };
  },
});
</script>
