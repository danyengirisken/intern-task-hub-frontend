/** Backend ile paylaşılan veri modelleri. */

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserDto {
  id: number;
  fullName: string;
  username: string;
  role: string;
}


export interface Project {
  id: number;
  partnerId: number;
  description: string | null;
  name: string;
  code: string | null;
  active: number | null;
 start_date?: string;
  end_date?: string;
}

export interface ProjectRequest {
  id?: number | null;
  partnerId?: number;
  description: string | null;
  name: string;
  code: string | null;
  active: number | null;
 startDate?: string;
  endDate?: string;    
}

/** Backend'den gelen düz (flat) menü öğesi (carbon S_MENU yapısı). */
export interface MenuDto {
  id: number;
  parentId: number | null;
  title: string;
  page: string | null;
  icon: string | null;
  menuOrder: number | null;
}

/** Üst menüde render edilen ağaç düğümü (parentId'ye göre kurulur). */
export interface MenuNode extends MenuDto {
  children: MenuNode[];
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  user: UserDto;
  menus: MenuDto[];
}

/** Görev (task) modülü. status: TODO|IN_PROGRESS|DONE, priority: LOW|MEDIUM|HIGH */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  dueDate: string | null; // ISO yyyy-MM-dd
  createdDate: string | null;
}

export interface TaskRequest {
  id?: number | null;
  title: string;
  description?: string | null;
  status: string;
  priority?: string | null;
  dueDate?: string | null;
}

/** Kullanıcı listesi / rol atama ekranı satırı. */
export interface UserListItem {
  id: number;
  fullName: string;
  username: string;
  roleId: number;
  roleName: string;
}

/** Rol seçim listesi ögesi. */
export interface RoleItem {
  id: number;
  name: string;
}

export interface AssignRoleRequest {
  userId: number;
  roleId: number;
}

// Backend'den gelecek olan veri modeli
export interface Sprint {
  id: number;
  name: string;
  description: string;
  project_id: number;
  start_date: string; // LocalDate Angular'a string (YYYY-MM-DD) olarak gelir
  end_date: string;
  active: number;
}

// Backend'e yeni sprint kaydederken göndereceğimiz model
export interface SprintRequest {
  name: string;
  description: string;
  projectId: number;
  startDate: string;
  endDate: string;
  active: number;
}

/**
 * Düz menü listesini parentId'ye göre ağaca dönüştürür ve menuOrder'a göre sıralar.
 * Parent'ı listede bulunmayan öğeler en üst seviyeye alınır (savunmacı).
 */
export function buildMenuTree(flat: MenuDto[]): MenuNode[] {
  const byId = new Map<number, MenuNode>();
  flat.forEach((m) => byId.set(m.id, { ...m, children: [] }));

  const roots: MenuNode[] = [];
  byId.forEach((node) => {
    if (node.parentId != null && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortByOrder = (a: MenuNode, b: MenuNode) =>
    (a.menuOrder ?? 9999) - (b.menuOrder ?? 9999);
  const sortRec = (nodes: MenuNode[]) => {
    nodes.sort(sortByOrder);
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
}
