<template>
<div :class="`relative w-full overflow-hidden ${className}`" @clientWidth="carouselWidth">
  <div class="flex h-full transition duration-500 ease-in-out" :style="`width: ${carouselWidth * items.length - 1}px; transform: translateX(-${carouselWidth * activeIndex}px);`">
    <template v-for="(item, i) in items" >
      <div class="h-full" :style="`width: ${carouselWidth}px;`">
        <slot name="carousel-content" :item="item" />
      </div>
    </template>
  </div>

  <template v-if="dots">
    <div class="flex justify-center mt-20px">
      <template v-for="(item, i) in items" >
        <button :class="`hover:opacity-75 ${i === activeIndex ? '' : 'opacity-50'}`" @click="() => goTo(i)">
          <template v-if="$$slots[`carousel-dots`]">
            <slot name="carousel-dots" />
          </template><template v-else>
            <div class="rounded-full btn w-10px h-10px mx-10px bg-primary" />
          </template>
        </button>
      </template>
    </div>
  </template>

  <template v-if="controls">
    <template v-if="activeIndex !== 0 || loop">
      <div class="absolute left-0 bg-transparent-black top-1/2 hover:opacity-75 mx-20px" @click="() => goTo(activeIndex - 1)">
        <img src="/assets/utility/arrow-down-white-big.svg" alt="arrow" class="transform rotate-90" />
      </div>
    </template>
    <template v-if="activeIndex !== items.length - 1 || loop">
      <div class="absolute right-0 bg-transparent-black top-1/2 hover:opacity-75 mx-20px" @click="() => goTo(activeIndex + 1)">
        <img src="/assets/utility/arrow-down-white-big.svg" alt="arrow" class="transform -rotate-90" />
      </div>
    </template>
  </template>

  <template v-if="total">
    <div class="absolute bottom-0 left-1/2 my-20px">
      <div class="relative text-white right-1/2 bg-transparent-black rounded-15px py-5px px-10px body-4">
        {{ $_('map.indexoftotal', {
          values: { n: activeIndex + 1, total: items.length }
        }) }}
      </div>
    </div>
  </template>
</div>
<template>
