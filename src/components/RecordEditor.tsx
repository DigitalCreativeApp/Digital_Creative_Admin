import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import type { AdminField, AdminResource } from '../types/admin.types';
import { fieldHint, fieldLabel, valueLabel } from '../config/admin-i18n';
import { adminService } from '../services/admin.service';
import { campaignDateError, defaultEditorValue, isImageField, isResourceFormField } from '../utils/field-presentation';
import { AppIcon } from './AppIcon';
import { fromVietnamDateTimeInput, toVietnamDateTimeInput } from '../utils/date-time';

type Props={resource:AdminResource;data:Record<string,unknown>;busy:boolean;onSave:(values:Record<string,unknown>)=>Promise<void>;onCancel:()=>void};

export function RecordEditor({resource,data,busy,onSave,onCancel}:Props){
 const fields=resource.fields.filter(x=>x.editable&&isResourceFormField(resource.key,x.name));
 const [values,setValues]=useState<Record<string,string>>(()=>Object.fromEntries(fields.map(x=>[x.name,x.type==='DateTimeOffset'?toVietnamDateTimeInput(data[x.name]):defaultEditorValue(x.type,x.options,data[x.name])])));
 const [uploading,setUploading]=useState('');
 const [uploadError,setUploadError]=useState('');
 const [validationError,setValidationError]=useState('');
 const [previews,setPreviews]=useState<Record<string,string>>({});
 useEffect(()=>()=>Object.values(previews).forEach(URL.revokeObjectURL),[previews]);

 async function submit(event:FormEvent){event.preventDefault();setValidationError('');if(resource.key==='campaigns'){const error=campaignDateError(values.StartsAt,values.EndsAt);if(error){setValidationError(error);return;}}const changed:Record<string,unknown>={};fields.forEach(field=>{const original=field.type==='DateTimeOffset'?toVietnamDateTimeInput(data[field.name]):String(data[field.name]??'');if(values[field.name]!==original)changed[field.name]=parseValue(field.type,values[field.name],field.nullable);});await onSave(changed);}
 async function selectImage(field:AdminField,event:ChangeEvent<HTMLInputElement>){
  const file=event.target.files?.[0]; if(!file)return;
  setUploadError('');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setUploadError('Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.');return;}
  if(file.size>10*1024*1024){setUploadError('Ảnh không được vượt quá 10 MB.');return;}
  const preview=URL.createObjectURL(file);setPreviews(current=>({...current,[field.name]:preview}));setUploading(field.name);
  try{const uploaded=await adminService.uploadImage(file);setValues(current=>({...current,[field.name]:uploaded.publicUrl}));}
  catch(error){setUploadError(error instanceof Error?error.message:'Không thể tải ảnh lên.');}
  finally{setUploading('');event.target.value='';}
 }

 return <form className="editor" onSubmit={submit}>
  {fields.map(field=>isImageField(field.name)?<ImageField key={field.name} field={field} value={values[field.name]} preview={previews[field.name]} uploading={uploading===field.name} onSelect={selectImage} required={resource.key==='campaigns'&&field.name==='CoverUrl'}/>:<label key={field.name}><span className="field-label-row"><span>{fieldLabel(field.name)}{!field.nullable&&' *'}</span>{fieldHint(field.name)&&<small>{fieldHint(field.name)}</small>}</span>{field.options?<select value={values[field.name]} onChange={e=>setValues(v=>({...v,[field.name]:e.target.value}))}>{field.nullable&&<option value="">—</option>}{field.options.filter(x=>x!=='Deleted').map(x=><option key={x} value={x}>{String(valueLabel(x))}</option>)}</select>:field.type==='Boolean'?<select value={values[field.name]} onChange={e=>setValues(v=>({...v,[field.name]:e.target.value}))}><option value="true">Có</option><option value="false">Không</option></select>:field.type==='DateTimeOffset'?<DateTimeField label={fieldLabel(field.name)} value={values[field.name]} onChange={value=>setValues(v=>({...v,[field.name]:value}))}/>:<input value={values[field.name]} maxLength={field.maxLength||undefined} type={['Int16','Int32','Int64','Decimal'].includes(field.type)?'number':'text'} onChange={e=>setValues(v=>({...v,[field.name]:e.target.value}))}/>}</label>)}
  {(uploadError||validationError)&&<p className="editor-error" role="alert">{uploadError||validationError}</p>}
  <div className="editor-actions"><button type="button" className="quiet" onClick={onCancel}>Hủy</button><button disabled={busy||Boolean(uploading)||fields.length===0}>{busy?'Đang lưu…':'Lưu thay đổi'}</button></div>
 </form>;
}

function DateTimeField({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void}){
 const input=useRef<HTMLInputElement>(null);
 function openPicker(){const element=input.current;if(!element)return;try{element.showPicker();}catch{element.focus();}}
 return <div className="date-time-field"><input ref={input} type="datetime-local" value={value} onChange={event=>onChange(event.target.value)}/><button type="button" onClick={openPicker} aria-label={`Chọn ${label.toLowerCase()} từ lịch`} title="Chọn từ lịch"><AppIcon name="calendar"/></button></div>;
}

function ImageField({field,value,preview,uploading,onSelect,required=false}:{field:AdminField;value:string;preview?:string;uploading:boolean;required?:boolean;onSelect:(field:AdminField,event:ChangeEvent<HTMLInputElement>)=>void}){
 const image=preview||value;
 return <div className="image-field"><div className="image-field-label"><span>{fieldLabel(field.name)}{(!field.nullable||required)&&' *'}</span><small>JPG, PNG hoặc WebP · tối đa 10 MB</small></div><div className="image-picker">{image?<img src={image} alt={`Xem trước ${fieldLabel(field.name)}`}/>:<div className="image-placeholder">Chưa có ảnh</div>}<label className="file-button"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>void onSelect(field,event)} disabled={uploading} required={required&&!image}/><span>{uploading?'Đang tải lên…':'Chọn ảnh từ máy tính'}</span></label></div></div>;
}

function parseValue(type:string,value:string,nullable:boolean){if(value===''&&nullable)return null;if(type==='DateTimeOffset')return fromVietnamDateTimeInput(value);if(type==='Boolean')return value==='true';if(['Int16','Int32','Int64','Decimal'].includes(type))return Number(value);return value;}
