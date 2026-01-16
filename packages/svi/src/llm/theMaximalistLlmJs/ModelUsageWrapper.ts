import { ModelUsage } from "@themaximalist/llm.js";

export default class ModelUsageWrapper {
  private modelUsage: ModelUsage;

  constructor(service?: string) {
    this.modelUsage = new ModelUsage(service as any);
  }

  getModel(
    model: string,
    quality_filter: { allowSimilar?: boolean } = {}
  ): any | null {
    return this.modelUsage.getModel(model, quality_filter);
  }

  async refresh() {
    await this.modelUsage.refresh();
  }

  models() {
    return this.modelUsage.models();
  }

  static get(
    service: string,
    model: string,
    quality_filter: { allowSimilar?: boolean } = {}
  ): any | null {
    return ModelUsage.get(service as any, model, quality_filter);
  }

  static getAll(): any[] {
    return ModelUsage.getAll();
  }

  static getByService(service?: string): any[] {
    return ModelUsage.getByService(service as any);
  }

  static getByServiceModel(service: string, model: string): any | null {
    return ModelUsage.getByServiceModel(service as any, model);
  }

  static filter(service?: string): (model: any) => boolean {
    return ModelUsage.filter(service as any);
  }

  static factories(data: any): any[] {
    return ModelUsage.factories(data);
  }

  static async refresh() {
    return await ModelUsage.refresh();
  }

  static addCustom(info: any) {
    ModelUsage.addCustom(info);
  }

  static getCustom(service: string, model: string): any | null {
    return ModelUsage.getCustom(service as any, model);
  }

  static getCustoms() {
    return ModelUsage.getCustoms();
  }

  static removeCustom(service: string, model: string) {
    ModelUsage.removeCustom(service as any, model);
  }

  static clearCustom() {
    ModelUsage.clearCustom();
  }
}
