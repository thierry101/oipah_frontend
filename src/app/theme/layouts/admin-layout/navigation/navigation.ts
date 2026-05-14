export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  groupClasses?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  link?: string;
  description?: string;
  path?: string;
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'default',
        title: 'Default',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard',
        icon: 'dashboard',
        breadcrumbs: false
      },
      {
        id: 'settings',
        title: 'Paramètres',
        type: 'item',
        classes: 'nav-item',
        url: '/settings',
        icon: 'setting',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'authentication',
    title: 'Authentication',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'users',
        title: 'Utilisateurs',
        type: 'item',
        classes: 'nav-item',
        url: '/users',
        icon: 'user',
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'utilities',
    title: 'Projets',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'plotLand',
        title: 'Parcelles',
        type: 'item',
        classes: 'nav-item',
        url: '/plot-of-land',
        icon: 'user'
      },
      {
        id: 'grantors',
        title: 'Subventionneurs',
        type: 'item',
        classes: 'nav-item',
        url: '/grantors',
        icon: 'user'
      },
        {
        id: 'Projects',
        title: 'Projet',
        type: 'item',
        classes: 'nav-item',
        url: '/project',
        icon: 'user'
      }
    ]
  }
];
