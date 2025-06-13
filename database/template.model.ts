import { model, models, Schema } from 'mongoose';

export type IModel = {
  template: string;
};

const TemplateSchema = new Schema<IModel>({
  template: { type: String, required: true },
}, { timestamps: true });

const Template = models?.Template || model<IModel>('Template', TemplateSchema);

export default Template;
