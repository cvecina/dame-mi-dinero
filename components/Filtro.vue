<template>
  <div class="drawer z-30">
    <input id="my-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content">
      <!-- Page content here -->
      <label
        for="my-drawer"
        class="boton__empresa drawer-button"
        style="z-index: 3"
        >{{ props.titulo }}</label
      >
    </div>
    <div class="drawer-side">
      <label
        for="my-drawer"
        aria-label="close sidebar"
        class="drawer-overlay"
      ></label>
      <ul class="menu p-4 w-80 min-h-full bg-[#F7F7FA] text-base-content">
        <!-- Sidebar content here -->
        <li class="menu-title">Filtros</li>
        <div v-if="props.filtros" class="flex flex-col">
          <span class="mr-2" v-for="(value, name) in props.filtros" :key="name">
            <span class="mr-2">
              {{ getCampoNombreFiltro(name, props.columnasFiltro)?.label }}
            </span>
            <span v-show="value.length > 0">
              <span
                class="badge badge-[#F7F7FA] m-1"
                v-for="dato in value"
                :key="dato"
                >{{ dato }}</span
              >
            </span>
            <span v-show="value.length == 0">
              <span class="badge m-1">-</span>
            </span>
          </span>
        </div>
        <div>
          <!-- Dynamically generate checkboxes for each unique value in each column -->
          <div v-for="(values, key) in columnValues" :key="key">
            <span class="flex items-center justify-start">
              <label class="pr-3">{{ getColumnLabel(key) }}</label>
              <button @click="toggleGroup(key)">
                {{ isGrouped[key] ? "-" : "+" }}
              </button>
            </span>
            <div v-if="isGrouped[key]">
              <div v-for="value in values" :key="value">
                <template v-if="getColumnValues(key, value) > 0">
                  <div
                    class="flex text-center m-2 items-center hover:bg-gray-200 hover:rounded-3xl p-1"
                  >
                    <input
                      class="checkbox"
                      type="checkbox"
                      :id="`${key}-${value}`"
                      :name="`${key}-${value}`"
                      v-model="filters[key]"
                      :value="value"
                      @change="updateFilteredArray"
                    />
                    <label class="cursor-pointer" :for="`${key}-${value}`">{{
                      value
                    }}</label>
                    <span v-if="key !== 'id'"
                      >({{ getColumnValues(key, value) }})</span
                    >
                  </div>
                </template>
                <template v-else>
                  <div
                    class="flex text-center m-2 items-center hover:bg-gray-200 hover:rounded-3xl p-1"
                  >
                    <input
                      type="checkbox"
                      class="checkbox"
                      :id="`${key}-${value}`"
                      disabled
                    />
                    <label :for="`${key}-${value}`">{{ value }}</label>
                    <span v-if="key !== 'id'">(0)</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <div v-if="filteredArray.length === 0">
            No hemos encontrado resultados.
          </div>
          <div v-else></div>
        </div>
      </ul>
    </div>
  </div>
</template>

  <script setup>
const props = defineProps({
  datos: {
    type: Object,
    required: true,
  },
  titulo: {
    type: String,
    required: true,
    default: "Filtros",
  },
  columnasFiltro: {
    type: Array,
    required: true,
  },
  filtros: {
    type: Array,
    required: false,
    default: [],
  },
});

const dataArray = ref([]);
const isGrouped = reactive({});
const emit = defineEmits(["datosFiltrados", "filtrosAplicados"]);

const enviarDatosFiltrados = () => {
  emit("datosFiltrados", filteredArray.value);
};

const enviarFiltrosAplicados = () => {
  emit("filtrosAplicados", filters);
};

onMounted(async () => {
  dataArray.value = props.datos;
});

// watch(
//   () => props.datos,
//   (newVal) => {
//     dataArray.value = newVal;
//   }
// );

// Compute unique values for each column
const columnValues = computed(() => {
  const values = {};
  dataArray.value.forEach((item) => {
    for (const key in item) {
      if (props.columnasFiltro) {
        if (props.columnasFiltro.some((col) => col.campo === key)) {
          if (!values[key]) {
            values[key] = new Set();
          }
          values[key].add(item[key]);
        }
      } else {
        if (!values[key]) {
          values[key] = new Set();
        }
        values[key].add(item[key]);
      }
    }
  });
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, Array.from(value)])
  );
});

// Define filters for each column as a reactive object
const filters = reactive({});
if (props.columnasFiltro) {
  for (const { campo } of props.columnasFiltro) {
    filters[campo] = [];
  }
} else {
  for (const key in columnValues.value) {
    filters[key] = [];
  }
}

// Compute filtered array based on selected filters
const filteredArray = computed(() => {
  return dataArray.value.filter((item) => {
    for (const key in filters) {
      if (filters[key].length > 0 && !filters[key].includes(item[key])) {
        return false;
      }
    }
    return true;
  });
});

// Esta función se encarga de obtener el label de la columna para los filtros en caso de tener columnasFiltro
const getColumnLabel = (key) => {
  if (!props.columnasFiltro) return key;
  const column = props.columnasFiltro.find((column) => column.campo === key);
  return column ? column.label : key;
};

// Update filtered array when a filter is clicked
function updateFilteredArray() {
  // Trigger reactivity by modifying a reactive property
  filters.value = { ...filters.value };
  enviarDatosFiltrados();
  enviarFiltrosAplicados();
}

function getCampoNombreFiltro(campo, store) {
  let dato = store.find((selector) => selector.campo === campo);
  return dato;
}

// Get all possible results for a specific column and value, filtered by other keys
function getColumnValues(columnKey, value) {
  let filteredData = [...dataArray.value];
  for (const key in filters) {
    if (key !== columnKey && filters[key].length > 0) {
      filteredData = filteredData.filter((item) =>
        filters[key].includes(item[key])
      );
    }
  }
  return filteredData.filter((item) => item[columnKey] === value).length;
}

const toggleGroup = (campo) => {
  if (isGrouped[campo] === undefined) {
    isGrouped[campo] = true;
  } else {
    isGrouped[campo] = !isGrouped[campo];
  }
};
</script>