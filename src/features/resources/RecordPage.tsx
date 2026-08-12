import { useEffect,useState } from 'react';
import { Link,useOutletContext,useParams } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import type { AdminOverview,AdminRecord,AdminResource } from '../../types/admin.types';
import { DataValue } from '../../components/DataValue';
import { ErrorState,LoadingState } from '../../components/AsyncState';
import { RecordEditor } from '../../components/RecordEditor';
import { fieldLabel,resourceLabel } from '../../config/admin-i18n';
import { fieldGroup, type FieldGroup } from '../../utils/field-presentation';

export function RecordPage(){
 const {key='',id=''}=useParams(); const {resources}=useOutletContext<{resources:AdminResource[]}>();
 const resource=resources.find(x=>x.key===key); const [record,setRecord]=useState<AdminRecord>(); const [overview,setOverview]=useState<AdminOverview>();
 const [error,setError]=useState(''); const [notice,setNotice]=useState(''); const [busy,setBusy]=useState(false); const [editing,setEditing]=useState(false);
 const load=async()=>{setError('');try{const [item,relations]=await Promise.all([adminService.record(key,id),adminService.overview(key,id)]);setRecord(item);setOverview(relations);}catch(e){setError(e instanceof Error?e.message:'Không tải được dữ liệu.');}};
 useEffect(()=>{void load();},[key,id]);
 async function action(kind:'delete'|'restore'){if(!resource?.canSoftDelete||!confirm(kind==='restore'?'Khôi phục dữ liệu này?':'Xóa mềm dữ liệu này? Dữ liệu vẫn được giữ trong cơ sở dữ liệu.'))return;setBusy(true);try{kind==='restore'?await adminService.restore(key,id):await adminService.softDelete(key,id);setNotice(kind==='restore'?'Đã khôi phục dữ liệu.':'Đã xóa mềm dữ liệu.');await load();}catch(e){setError(e instanceof Error?e.message:'Thao tác thất bại.');}finally{setBusy(false);}}
 async function save(values:Record<string,unknown>){if(!Object.keys(values).length){setEditing(false);return;}setBusy(true);try{setRecord(await adminService.update(key,id,values));setEditing(false);setNotice('Đã cập nhật dữ liệu.');await load();}catch(e){setError(e instanceof Error?e.message:'Không thể cập nhật.');}finally{setBusy(false);}}
 if(error)return <ErrorState message={error} retry={()=>void load()}/>; if(!record||!resource||!overview)return <LoadingState/>;
 const isDeleted=Boolean(record.data.DeletedAt); const title=resourceLabel(key,resource.name);
 return <><div className="page-title"><div><p><Link to={`/resources/${key}`}>← {title}</Link></p><h1>Chi tiết {title.toLowerCase()}</h1></div><div className="actions">{resource.canEdit&&!isDeleted&&<button onClick={()=>setEditing(x=>!x)}>{editing?'Đóng biểu mẫu':'Chỉnh sửa'}</button>}{resource.canRestore&&isDeleted?<button disabled={busy} onClick={()=>void action('restore')}>Khôi phục</button>:resource.canSoftDelete&&<button className="danger" disabled={busy} onClick={()=>void action('delete')}>Xóa mềm</button>}</div></div>
 {notice&&<p className="notice" role="status">{notice}</p>}
 {editing?<RecordEditor resource={resource} data={record.data} busy={busy} onSave={save} onCancel={()=>setEditing(false)}/>:<RecordDetails data={record.data}/>} 
 <section className="related-area"><div className="section-heading"><div><p>DỮ LIỆU LIÊN QUAN</p><h2>Toàn bộ hoạt động</h2></div><span>{overview.sections.reduce((sum,x)=>sum+x.total,0).toLocaleString('vi-VN')} mục</span></div>
 {overview.sections.length===0?<div className="related-empty">Chưa có dữ liệu hoặc hoạt động liên quan.</div>:overview.sections.map(section=><RelatedSection key={section.resource} section={section} resources={resources}/>)}</section></>;
}

function RelatedSection({section,resources}:{section:AdminOverview['sections'][number];resources:AdminResource[]}){
 const meta=resources.find(x=>x.key===section.resource); const columns=(meta?.fields.filter(x=>section.items.some(row=>row[x.name]!==null&&row[x.name]!==undefined)).slice(0,6).map(x=>x.name)||Object.keys(section.items[0]||{}).slice(0,6));
 return <details className="related-section" open={section.resource==='conversationmembers'||section.resource==='messages'}><summary><strong>{resourceLabel(section.resource,meta?.name)}</strong><span>{section.total.toLocaleString('vi-VN')}</span></summary><div className="table-wrap"><table><thead><tr>{columns.map(name=><th key={name}>{fieldLabel(name)}</th>)}<th/></tr></thead><tbody>{section.items.map((row,index)=>{const rowId=String(row[meta?.keyField||'Id']??'');return <tr key={rowId||index}>{columns.map(name=><td key={name}><DataValue value={row[name]}/></td>)}<td>{meta&&rowId&&<Link className="row-link" to={`/resources/${section.resource}/${rowId}`}>Xem →</Link>}</td></tr>;})}</tbody></table></div>{section.total>section.items.length&&<Link className="related-more" to={`/resources/${section.resource}`}>Xem tất cả {section.total.toLocaleString('vi-VN')} mục →</Link>}</details>;
}

const groupLabels:Record<FieldGroup,string>={primary:'Thông tin chính',media:'Hình ảnh',content:'Nội dung',status:'Trạng thái',system:'Thông tin hệ thống'};
function RecordDetails({data}:{data:Record<string,unknown>}){
 const groups=Object.entries(data).reduce((result,[name,value])=>{const group=fieldGroup(name);(result[group]??=[]).push([name,value]);return result;},{} as Partial<Record<FieldGroup,[string,unknown][]>>);
 return <div className="record-sections">{(['primary','media','content','status','system'] as FieldGroup[]).map(group=>groups[group]?.length?<section className={`record-section ${group}`} key={group}><header><h2>{groupLabels[group]}</h2><span>{groups[group]!.length} trường</span></header><dl className="record">{groups[group]!.map(([name,value])=><div key={name}><dt>{fieldLabel(name)}</dt><dd><DataValue value={value} fieldName={name} expanded={group==='media'}/></dd></div>)}</dl></section>:null)}</div>;
}
