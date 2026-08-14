import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { adminService } from '../services/admin.service';
import type { AdminResource } from '../types/admin.types';
import { useAuth } from '../store/auth-context';
import { resourceGroup } from '../config/resource-groups';
import { AppIcon } from '../components/AppIcon';
import { primaryResources, resourceLabel } from '../config/admin-i18n';

const groupIcons: Record<string,string> = { 'Người dùng':'users','Nội dung sáng tạo':'content','Công việc và giao dịch':'projects','Cộng đồng':'operations','Tài chính':'finance','Vận hành':'system',Khác:'database' };

export function AdminLayout() {
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compact, setCompact] = useState(() => localStorage.getItem('admin_sidebar_compact') === '1');
  const [query, setQuery] = useState('');
  const [closedGroups, setClosedGroups] = useState<string[]>([]);
  const { user, signOut } = useAuth();
  const location = useLocation();
  useEffect(() => { adminService.resources().then(setResources).catch(() => setResources([])); }, []);
  useEffect(() => setMobileOpen(false), [location.pathname]);
  const filtered = useMemo(() => resources.filter(x => primaryResources.has(x.key) && `${resourceLabel(x.key,x.name)} ${x.table}`.toLowerCase().includes(query.trim().toLowerCase())), [resources, query]);
  const groups = [...new Set(filtered.map(x => resourceGroup(x.key)))];
  const activeResource = resources.find(x => location.pathname.includes(`/resources/${x.key}`));
  function toggleCompact() { setCompact(value => { localStorage.setItem('admin_sidebar_compact', value ? '0' : '1'); return !value; }); }
  function toggleGroup(group: string) { setClosedGroups(values => values.includes(group) ? values.filter(x => x !== group) : [...values, group]); }

  return <div className={`shell ${compact ? 'sidebar-compact' : ''}`}>
    {mobileOpen && <button className="sidebar-backdrop" aria-label="Đóng menu" onClick={() => setMobileOpen(false)} />}
    <aside className={mobileOpen ? 'sidebar open' : 'sidebar'}>
      <div className="brand"><span className="brand-mark">DC</span><div className="brand-copy">Digital Creative<small>ADMIN CENTER</small></div><button className="collapse" onClick={toggleCompact} aria-label={compact ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}><AppIcon name="collapse" /></button></div>
      <div className="sidebar-search"><AppIcon name="search"/><input aria-label="Tìm nhóm dữ liệu" placeholder="Tìm dữ liệu…" value={query} onChange={event => setQuery(event.target.value)} /></div>
      <nav aria-label="Điều hướng quản trị">
        <NavLink to="/" end className="nav-item"><span className="nav-icon"><AppIcon name="dashboard"/></span><span className="nav-text">Tổng quan</span></NavLink>
        <NavLink to="/settings/platform-fee" className="nav-item"><span className="nav-icon"><AppIcon name="finance"/></span><span className="nav-text">Cấu hình phí</span></NavLink>
        <div className="nav-separator"><span>Không gian quản trị</span></div>
        {groups.map(group => <section className="nav-group" key={group}>
          <button className="nav-group-title" onClick={() => toggleGroup(group)} aria-expanded={!closedGroups.includes(group)}><span className="nav-icon"><AppIcon name={groupIcons[group]}/></span><span className="nav-text">{group}</span><AppIcon name="chevron" className={`group-arrow ${closedGroups.includes(group) ? '' : 'expanded'}`}/></button>
          {!closedGroups.includes(group) && <div className="nav-group-items">{filtered.filter(x => resourceGroup(x.key) === group).map(x => <NavLink key={x.key} to={`/resources/${x.key}`} className="resource-link"><span className="resource-dot"/><span className="nav-text">{resourceLabel(x.key,x.name)}</span></NavLink>)}</div>}
        </section>)}
        {filtered.length === 0 && <p className="nav-empty">Không tìm thấy dữ liệu</p>}
      </nav>
      <footer className="sidebar-footer"><div className="admin-avatar">{initials(user?.displayName)}</div><div className="admin-copy"><strong>{user?.displayName}</strong><small>Quản trị viên</small></div><button onClick={() => void signOut()} aria-label="Đăng xuất" title="Đăng xuất"><AppIcon name="logout"/></button></footer>
    </aside>
    <div className="workspace">
      <header className="topbar"><button className="menu" onClick={() => setMobileOpen(true)} aria-label="Mở menu"><AppIcon name="menu"/></button><div className="breadcrumb"><span>Quản trị</span><AppIcon name="chevron"/>{activeResource ? <strong>{resourceLabel(activeResource.key,activeResource.name)}</strong> : <strong>{location.pathname.startsWith('/settings/') ? 'Cấu hình phí' : 'Tổng quan'}</strong>}</div><div className="topbar-status"><span className="online-dot"/><span>Hệ thống hoạt động</span></div><button className="topbar-logout" onClick={() => void signOut()}><AppIcon name="logout"/><span>Đăng xuất</span></button></header>
      <main id="main-content"><Outlet context={{ resources }} /></main>
    </div>
  </div>;
}

function initials(name?: string) { return (name || 'AD').split(' ').slice(-2).map(x => x[0]).join('').toUpperCase(); }
