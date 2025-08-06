<template>
  <div class="div--tabla-motivales">
    <table class="tabla-motivales">
      <thead class="thead-motivales" style="z-index: 1">
        <tr class="tr-header-motivales">
          <th
            v-for="campo in camposTabla"
            :key="campo.campo"
            v-show="campo.visible == true && campo.activo == true"
            class="th-motivales"
          >
            {{ campo.label }}
          </th>
          <th class="th-motivales">Acciones</th>
        </tr>
      </thead>
      <tbody class="tbody-motivales">
        <tr
          v-for="item in datos"
          :key="item.id"
          class="tr-body-motivales"
        >
          <td
            v-for="campo in camposTabla"
            :key="campo.campo"
            v-show="campo.visible == true && campo.activo == true"
            class="table__default--td"
          >
            <div>
              {{ item[campo.campo] }}
            </div>
          </td>
          <td class="table__default--td">
            <span v-for="btn in props.buttons" :key="btn" class="m-2">
              <div
                v-if="comprobarBotonYActivo(item, btn)"
                class="flex flex-col"
              >
                <button
                  v-show="btn.condicion"
                  :class="btn.class"
                  @click="btn.action(item)"
                >
                  {{ btn.label }}
                </button>
              </div>
              <!-- <button
                v-if="
                  btn.label == 'Desactivar usuario'
                "
                v-show="comprobarSiActivo(item, 'desactivar')"
                :class="btn.class"
                @click="btn.action(item)"
              >
                {{ btn.label }}
              </button> -->
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const emit = defineEmits(["condicion"]);

const props = defineProps({
  camposTabla: Array,
  datos: Array,
  buttons: Array,
});

const comprobarBotonYActivo = (item, btn) => {
  if (btn.label == "Desactivar usuario") {
    return !item.disabled;
  }
  if (btn.label == "Activar usuario") {
    return item.disabled;
  }

  return true;
};
</script>