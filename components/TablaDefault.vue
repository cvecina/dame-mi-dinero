<template>
  <div class="flex flex-col justify-center items-center">
    <section
      class="flex bg-white p-4 flex-col rounded-2xl mt-6 w-11/12 xl:w-11/12 lg:w-11/12"
    >
      <div class="flex flex-col">
        <div class="text-2xl text-black font-bold">{{ props.titulo }}</div>
        <div class="menu__tabla">
          <!-- SEARCH -->
          <span class="menu__tabla--izquierda">
            <slot class="pt-6 pb-6" name="zona__izquierda"></slot>
          </span>
          <span class="menu__tabla--derecha">
            <slot name="zona__derecha"></slot>
          </span>
        </div>
        <div class="hidden md:block">
          <table class="tabla-motivales" v-if="props.datos.length > 0">
            <thead class="thead-motivales" style="z-index: 1">
              <tr class="tr-header-motivales">
                <th
                  v-for="campo in camposTabla"
                  :key="campo.campo"
                  v-show="campo.visible && campo.activo"
                  class="th-motivales"
                >
                  {{ campo.label }}
                </th>
                <th v-if="props.remove" class="th-motivales"></th>
              </tr>
            </thead>
            <tbody class="tbody-motivales text-gray-500">
              <tr
                v-for="item in datos"
                :key="item.id"
                class="tr-body-motivales"
              >
                <td
                  v-for="campo in camposTabla"
                  :key="campo.campo"
                  v-show="campo.visible && campo.activo"
                  class="table__default--td"
                >
                  <div class="flex justify-center items-center">
                    {{ item[campo.campo] }}
                    <span class="flex justify-center">
                      <span
                        v-if="props.editar"
                        class="cursor-pointer pl-3"
                        @click="props.editar(item)"
                        ><img src="@/assets/img/comunes/edit_pencil.svg"
                      /></span>
                    </span>
                  </div>
                </td>
                <td v-if="props.isActive" class="table__default--td">
                  <div class="flex justify-center items-center">
                    <span class="flex justify-center items-center">
                      {{ item.disabled ? "Inactivo" : "Activo" }}
                      <img
                        v-if="!item.disabled"
                        class="flex justify-center items-center pl-2 cursor-pointer"
                        @click="cambiarEstadoUser(item)"
                        src="@/assets/img/comunes/check_circle.svg"
                      />
                      <img
                        v-else
                        class="flex justify-center items-center pl-2 cursor-pointer"
                        @click="cambiarEstadoUser(item)"
                        src="@/assets/img/comunes/inactive.svg"
                      />
                    </span>
                  </div>
                </td>
                <td v-if="props.changePass" class="table__default--td">
                  <div class="flex justify-center items-center">
                    <span class="flex justify-center items-center">
                      **********
                      <img
                        class="flex justify-center items-center cursor-pointer"
                        @click="changePassUser(item)"
                        src="@/assets/img/comunes/edit_pencil.svg"
                      />
                    </span>
                  </div>
                </td>
                <span v-if="props.extra">
                  <td
                    v-for="data in props.extra"
                    :key="data"
                    class="table__default--td"
                  >
                    <div
                      class="flex justify-center items-center"
                      v-if="data.condicion"
                    >
                      <span class="flex justify-center items-center">
                        <button
                          @click="data.action(item)"
                          class="btn btn-primary"
                        >
                          {{ data.icon ? data.icon : data.label }}
                        </button>
                      </span>
                    </div>
                  </td>
                </span>
                <td class="table__default--td">
                  <button v-if="props.remove" @click="props.remove(item)">
                    <img src="@/assets/img/comunes/remove.svg" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="justify-center flex" v-if="props.datos.length == 0">
            <div class="text-center">
              <p>No hay datos</p>
            </div>
          </div>
        </div>
        <div class="block md:hidden w-full">
          <div
            class="collapse collapse-arrow border-t rounded-none border-[#D9D9D9]"
            v-for="(item, index) in datos"
            :key="item.id"
            :class="clasePersonalizada(index)"
          >
            <input
              type="radio"
              name="my-accordion-4"
              checked="checked"
              @click="modificarEstado(index)"
            />
            <div class="collapse-title text-lg font-medium text-[#7C808C]">
              <!-- esto habrá que cambiarlo en un futuro -->
              Nombre del campo
            </div>
            <div class="collapse-content">
              <div class="flex justify-end items-center">
                <button v-if="props.remove" @click="props.remove(item)">
                  <img src="@/assets/img/comunes/remove.svg" />
                </button>
              </div>
              <p
                v-for="campo in camposTabla"
                :key="campo.campo"
                v-show="campo.visible && campo.activo"
              >
                <span class="flex flex-row justify-start items-center">
                  <span class="text-[#A0A8BD] pr-1">{{ campo.label }}: </span>
                  <span class="text-[#7C808C] flex items-center">
                    {{ item[campo.campo] }}
                    <span
                      v-if="props.editar"
                      class="cursor-pointer pl-3"
                      @click="props.editar(item)"
                      ><img src="@/assets/img/comunes/edit_pencil.svg"
                    /></span>
                  </span>
                </span>
              </p>
              <span
                v-if="props.isActive"
                class="flex items-center flex-row text-[#A0A8BD]"
              >
                <div class="flex justify-center items-center">
                  <span class="flex justify-center items-center">
                    {{ item.disabled ? "Inactivo" : "Activo" }}
                    <img
                      v-if="!item.disabled"
                      class="flex justify-center items-center pl-2 cursor-pointer"
                      @click="cambiarEstadoUser(item)"
                      src="@/assets/img/comunes/check_circle.svg"
                    />
                    <img
                      v-else
                      class="flex justify-center items-center pl-2 cursor-pointer"
                      @click="cambiarEstadoUser(item)"
                      src="@/assets/img/comunes/inactive.svg"
                    />
                  </span>
                </div>
              </span>
              <span
                v-if="props.changePass"
                class="flex items-center flex-row text-[#A0A8BD]"
              >
                <div class="flex justify-center items-center">
                  <span class="flex justify-center items-center">
                    **********
                    <img
                      class="flex justify-center items-center cursor-pointer"
                      @click="changePassUser(item)"
                      src="@/assets/img/comunes/edit_pencil.svg"
                    />
                  </span>
                </div>
              </span>
              <span v-if="props.extra">
                <span v-for="data in props.extra" :key="data">
                  <div class="flex" v-if="data.condicion">
                    <span class="flex">
                      <button
                        @click="data.action(item)"
                        class="btn btn-primary"
                      >
                        {{ data.icon ? data.icon : data.label }}
                      </button>
                    </span>
                  </div>
                </span>
              </span>
            </div>
          </div>
        </div>
        <span v-if="totalData">
          <Paginacion
            class="pt-2"
            :totalData="props.totalData"
            :limit="props.limit"
            :offset="props.offset"
            @cambiarPagina="emit('cambiarPagina', $event)"
          ></Paginacion>
        </span>
      </div>
    </section>
  </div>
</template>
<script setup>
const emit = defineEmits(["condicion", "buscarDatos"]);

const props = defineProps({
  camposTabla: Array,
  titulo: { type: String, default: "TITULO TABLA DEFAULT" },
  datos: Array,
  buttons: Array,
  extra: Array,
  changePass: Boolean,
  isActive: Boolean,
  totalData: Number,
  limit: Number,
  editar: Function,
  remove: Function,
  offset: Number,
});
const estadosAbiertos = ref({});

const modificarEstado = (index) => {
  estadosAbiertos.value = {
    ...estadosAbiertos.value,
    [index]: !estadosAbiertos.value[index],
  };
};

const clasePersonalizada = (index) => {
  return estadosAbiertos.value[index] ? "collapse-open" : "collapse-close";
};

watch(estadosAbiertos, (value) => {
  console.log("Estados abiertos:", value);
});

const changePassUser = (dato) => {
  emit("changePassUser", dato);
};

const cambiarEstadoUser = (dato) => {
  emit("cambiarEstadoUser", dato);
};
</script>