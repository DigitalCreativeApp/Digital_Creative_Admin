import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { adminService } from '../services/admin.service';
import type { AdminResource } from '../types/admin.types';
import { useAuth } from '../store/auth-context';
import { resourceGroup } from '../config/resource-groups';

export function AdminLayout() {
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  useEffect(() => { adminService.resources().then(setResources).catch(() => setResources([])); }, []);
  return <div className="shell">
    <aside className={open ? 'sidebar open' : 'sidebar'}>
      <div className="brand"><span>DC</span><div>Digital Creative<small>ADMIN CONSOLE</small></div></div>
      <nav aria-label="Điều hướng quản trị">
        <NavLink to="/" end>▦ Tổng quan</NavLink>
        {[...new Set(resources.map(x => resourceGroup(x.key)))].map(group => <div className="nav-group" key={group}><p className="nav-label">{group}</p>{resources.filter(x => resourceGroup(x.key) === group).map(x => <NavLink key={x.key} to={`/resources/${x.key}`} onClick={() => setOpen(false)}>{x.name}</NavLink>)}</div>)}
      </nav>
    </aside>
    <div className="workspace">
      <header><button className="menu" onClick={() => setOpen(x => !x)} aria-label="Mở menu">☰</button><div><strong>{user?.displayName}</strong><small>{user?.email}</small></div><button className="quiet" onClick={() => void signOut()}>Đăng xuất</button></header>
      <main><Outlet context={{ resources }} /></main>
    </div>
  </div>;
}
