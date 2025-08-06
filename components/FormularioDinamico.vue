<template>
  <div class="flex pt-10 justify-center items-center">
    <section
      class="flex bg-white rounded-2xl pt-7 justify-center items-center w-11/12 lg:w-1/2 md:w-9/12"
    >
      <span class="mx-auto p-10">
        <h1 class="text-3xl text-black pb-5">{{ titulo }}</h1>
        <span v-for="form in camposFormulario" :key="form.campo_bbdd">
          <label
            class="block text-gray-300 text-sm font-bold mb-2"
            :for="form.campo_bbdd"
          >
            {{ form.label }}
          </label>
          <!-- RANGO -->
          <div v-if="form.tipo === 'rango'">
            <label class="flex m-2 p-3" for="range">
              <input
                type="range"
                :min="form.min"
                :max="form.max"
                v-model="store[form.campo__bbdd]"
                class="range range-sm"
                :step="form.step"
              />
              <span class="pl-4" v-show="store[form.campo__bbdd]">
                <span v-if="form.formatear == 'time'" class="flex flex-row">
                  {{ getMinFromSec(store[form.campo__bbdd]) }}
                </span>
                <span v-else>
                  {{ store[form.campo__bbdd] }}
                </span>
              </span>
            </label>
          </div>

          <!-- MULTISELECT -->
          <div class="mb-4" v-if="form.tipo === 'multiselect'">
            <div
              tabindex="0"
              class="dropdown dropdown-hover shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <div tabindex="0" role="button" class="">
                {{ form.placeholder }}
              </div>
              <ul
                tabindex="0"
                style="z-index: 2"
                class="dropdown-content z-[2] menu bg-white shadow-lg w-96"
              >
                <li v-for="selector in form.listaSelectores" :key="selector.id">
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      class="checkbox"
                      :checked="isSelected(selector, form.campo_bbdd)"
                      @change="insertMulti(selector, form.campo_bbdd, $event)"
                    />
                    <label :for="selector.campo" class="font-medium">
                      {{ selector.label }}
                    </label>
                  </div>
                </li>
              </ul>
            </div>
            <span v-for="valor in store[form.campo_bbdd]" :key="valor.id">
              <span class="badge m-1">{{ valor.label }}</span>
            </span>
          </div>

          <!-- Otros tipos de campos -->
          <div class="mb-4" v-else-if="form.tipo === 'selector'">
            <select
              class="shadow border rounded w-full py-2 px-3 text-gray-700"
              v-model="store[form.campo_bbdd]"
            >
              <option selected disabled :value="null">
                {{ form.placeholder }}
              </option>
              <option v-for="opt in form.lista" :key="opt.id" :value="opt.id">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div class="mb-4" v-else-if="form.tipo === 'numeric'">
            <input
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              v-model="store[form.campo_bbdd]"
              type="number"
              :placeholder="form.placeholder"
            />
          </div>

          <div
            class="mb-4"
            v-else-if="form.tipo === 'boolean' && form.prueba === true"
          >
            <input
              class="toggle"
              v-model="store[form.campo_bbdd]"
              type="checkbox"
            />
            <br />
            <span v-if="store[form.campo_bbdd]" class="text-red-200"
              >Perido de prueba activado</span
            >
            <span v-else class="text-red-200"
              >Perido de prueba desactivado</span
            >
          </div>

          <div
            class="mb-4"
            v-else-if="form.tipo === 'boolean' && form.prueba === false"
          >
            <input
              class="toggle"
              v-model="store[form.campo_bbdd]"
              type="checkbox"
            />
          </div>

          <div class="mb-4" v-else-if="form.tipo === 'cal'">
            <input
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              v-model="store[form.campo_bbdd]"
              type="date"
              :placeholder="form.placeholder"
            />
          </div>

          <div class="mb-4" v-else-if="form.tipo === 'horas'">
            <input
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              v-model="store[form.campo_bbdd]"
              type="time"
              :placeholder="form.placeholder"
            />
          </div>

          <div class="mb-4" v-else-if="form.tipo === 'text'">
            <input
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              v-model="store[form.campo_bbdd]"
              type="text"
              :placeholder="form.placeholder"
            />
          </div>

          <div class="mb-4" v-else-if="form.tipo === 'password'">
            <input
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              v-model="store[form.campo_bbdd]"
              type="password"
              :placeholder="form.placeholder"
            />
          </div>

          <div class="mb-4" v-else-if="form.tipo === 'email'">
            <input
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              v-model="store[form.campo_bbdd]"
              type="email"
              :placeholder="form.placeholder"
            />
          </div>
        </span>
        <slot name="extra"></slot>
        <span
          v-for="button in buttonsFormulario"
          :key="button.text"
          class="m-2 flex justify-center items-center"
        >
          <button class="boton__empresa" @click="button.action">
            <span class="opacity-70 cursor-pointer">{{ button.text }}</span>
          </button>
        </span>
      </span>
    </section>
  </div>
</template>

<script setup>
const props = defineProps({
  titulo: String,
  camposFormulario: Array,
  buttonsFormulario: Array,
  store: Object,
});

const insertMulti = (selector, campo_bbdd, $event) => {
  if (!props.store[campo_bbdd]) {
    props.store[campo_bbdd] = [];
  }

  if ($event.target.checked) {
    props.store[campo_bbdd].push(selector);
  } else {
    props.store[campo_bbdd] = props.store[campo_bbdd].filter(
      (item) => item.id !== selector.id
    );
  }
};

const isSelected = (selector, campo_bbdd) => {
  return (
    props.store[campo_bbdd] &&
    Array.isArray(props.store[campo_bbdd]) &&
    props.store[campo_bbdd].some((item) => item.id === selector.id)
  );
};
</script>