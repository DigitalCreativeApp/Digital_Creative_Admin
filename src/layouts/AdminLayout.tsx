import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { adminService } from '../services/admin.service';
import type { AdminResource } from '../types/admin.types';
import { useAuth } from '../store/auth-context';
import { AppIcon } from '../components/AppIcon';
import { operationsNavigation, operationsRouteLabel } from '../config/operations-navigation';
import { WORK_ORDER_DISPUTES_VISIBLE } from '../config/feature-flags';

export function AdminLayout() {
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compact, setCompact] = useState(() => localStorage.getItem('admin_sidebar_compact') === '1');
  const [query, setQuery] = useState('');
  const { user, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => { adminService.resources().then(setResources).catch(() => setResources([])); }, []);
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const groups = useMemo(() => operationsNavigation.map(group => ({
    ...group,
    items: group.items.filter(item => (!item.disputeFeature || WORK_ORDER_DISPUTES_VISIBLE)
      && item.label.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi'))),
  })).filter(group => group.items.length), [query]);

  function toggleCompact() {
    setCompact(value => {
      localStorage.setItem('admin_sidebar_compact', value ? '0' : '1');
      return !value;
    });
  }

  return <div className={`shell ops-shell ${compact ? 'sidebar-compact' : ''}`}>
    {mobileOpen ? <button className="sidebar-backdrop" aria-label="Đóng menu" onClick={() => setMobileOpen(false)} /> : null}
    <aside className={mobileOpen ? 'sidebar open' : 'sidebar'}>
      <div className="brand"><span className="brand-mark">DC</span><div className="brand-copy">Digital Creative<small>ADMIN CENTER</small></div><button className="collapse" type="button" onClick={toggleCompact} aria-label={compact ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}><AppIcon name="collapse" /></button></div>
      <div className="sidebar-search"><AppIcon name="search"/><input aria-label="Lọc menu quản trị" placeholder="Lọc menu…" value={query} onChange={event => setQuery(event.target.value)} /></div>
      <nav aria-label="Điều hướng quản trị">
        {groups.map(group => <section className="ops-nav-group" key={group.label}><h2>{group.label}</h2>{group.items.map(item => <NavLink key={item.to} to={item.to} end={item.to === '/'} className="nav-item"><span className="nav-icon"><AppIcon name={item.icon}/></span><span className="nav-text">{item.label}</span></NavLink>)}</section>)}
        {groups.length === 0 ? <p className="nav-empty">Không tìm thấy mục phù hợp</p> : null}
      </nav>
      <footer className="sidebar-footer"><div className="admin-avatar">{initials(user?.displayName)}</div><div className="admin-copy"><strong>{user?.displayName}</strong><small>Quản trị viên</small></div><button type="button" onClick={() => void signOut()} aria-label="Đăng xuất" title="Đăng xuất"><AppIcon name="logout"/></button></footer>
    </aside>
    <div className="workspace">
      <header className="topbar"><button className="menu" type="button" onClick={() => setMobileOpen(true)} aria-label="Mở menu"><AppIcon name="menu"/></button><div className="breadcrumb"><span>Vận hành</span><AppIcon name="chevron"/><strong>{operationsRouteLabel(location.pathname)}</strong></div><div className="topbar-status"><span className="online-dot"/><span>Kết nối hệ thống</span></div><button className="topbar-logout" type="button" onClick={() => void signOut()}><AppIcon name="logout"/><span>Đăng xuất</span></button></header>
      <main id="main-content"><Outlet context={{ resources }} /></main>
    </div>
  </div>;
}

function initials(name?: string) {
  return (name || 'AD').split(' ').filter(Boolean).slice(-2).map(part => part[0]).join('').toUpperCase();
}
