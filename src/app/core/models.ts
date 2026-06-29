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
