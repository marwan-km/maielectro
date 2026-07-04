import { ChevronDown } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button as HeroButton } from '@heroui/react/button';
import { Dropdown } from '@heroui/react/dropdown';
import { categories } from '../../data/categories.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function Navbar() {
  const { t } = useI18n();

  const navLinkClass = ({ isActive }) =>
    `px-4 py-3 text-sm font-semibold transition-all duration-200 hover:text-white ${
      isActive
        ? 'border-b-2 border-white text-white'
        : 'text-slate-300'
    }`;

  return (
    <nav className="sticky top-[65px] z-30 hidden border-b border-slate-800 bg-slate-950 transition-colors duration-300 lg:block">
      <div className="container-shell flex min-w-0 items-center justify-between">
        <div className="flex min-w-0 items-center">
          <NavLink to="/shop" className={navLinkClass}>
            {t('shop')}
          </NavLink>

          {categories.map((category) =>
            category.children.length > 0 ? (
              <Dropdown key={category.id}>
                <Dropdown.Trigger>
                  <HeroButton className="flex items-center gap-1 rounded-none bg-transparent px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:text-white">
                    {t(category.nameKey)} <ChevronDown className="h-4 w-4" />
                  </HeroButton>
                </Dropdown.Trigger>
                <Dropdown.Popover className="rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-lg">
                  <Dropdown.Menu>
                    {category.children.map((child) => (
                      <Dropdown.Item
                        key={child.id}
                        href={child.path}
                        className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white"
                      >
                        {child.name}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            ) : (
              <NavLink
                key={category.id}
                to={category.path}
                className={({ isActive }) =>
                  `flex items-center gap-1 px-4 py-3 text-sm font-semibold transition-all duration-200 hover:text-white ${
                    isActive
                      ? 'border-b-2 border-white text-white'
                      : 'text-slate-300'
                  }`
                }
              >
                {t(category.nameKey)}
              </NavLink>
            )
          )}

          <NavLink to="/reparation" className={navLinkClass}>
            {t('repair')}
          </NavLink>
        </div>

        <NavLink
          to="/contact"
          className="my-2 rounded-xl border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-100 transition-colors hover:border-slate-500 hover:bg-slate-800 hover:text-white"
        >
          {t('contact')}
        </NavLink>
      </div>
    </nav>
  );
}
