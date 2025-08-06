import { defineStore } from "pinia";
export const useAlertStore = defineStore({
    id: "alert",
    state: () => ({
        // alert: { message: "mensaje de prueba", type: warn },
        alert: {},
    }),
    actions: {
        clear() {
            this.alert = {};
        },

        success(message, tiempo = 2000) {
            this.alert = { message, type: "success" };
            setTimeout(() => {
                this.clear();
            }, tiempo);
        },

        error(message, tiempo = 2000) {
            this.alert = { message, type: "error" };
            setTimeout(() => {
                this.clear();
            }, tiempo);
        },

        warn(message, tiempo = 2000) {
            this.alert = { message, type: "warn" };
            setTimeout(() => {
                this.clear();
            }, tiempo);
        }

        // activarToast(options: MessageOptions = {}): () => void {
        //     const { tiempo = 1000, message = 'Default Message', type = 'error' } = options;
        //     this.alert = { message: message, type: type };
        //     setTimeout(() => {
        //         this.clear();

        //     }, tiempo);
        //     return () => {

        //     };
        // }
    },
});











