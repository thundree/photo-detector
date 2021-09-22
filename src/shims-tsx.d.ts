import Vue, { VNode } from "vue";

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }

  type VueElement =
    | Vue
    | Element
    | (Vue | Element)[]
    | undefined
    | HTMLElement
    | any;

  interface UnknownObj {
    [key: string]: string | number | object | any;
  }

  interface BasicRecord {
    id?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  }
}
