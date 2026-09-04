export type AppView = "planner" | "details" | "checklists" | "saved" | "settings";

interface BottomNavProps {
  activeView: AppView;
  onChange: (view: AppView) => void;
}

const navItems: Array<{ view: AppView; label: string; icon: string }> = [
  { view: "planner", label: "Подбор", icon: "⌁" },
  { view: "details", label: "Детали", icon: "◎" },
  { view: "checklists", label: "Вещи", icon: "☑" },
  { view: "saved", label: "Планы", icon: "☆" },
  { view: "settings", label: "Дом", icon: "⌂" },
];

export function BottomNav({ activeView, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Основная навигация">
      {navItems.map((item) => (
        <button
          className={activeView === item.view ? "bottom-nav__item is-active" : "bottom-nav__item"}
          key={item.view}
          onClick={() => onChange(item.view)}
          type="button"
        >
          <span aria-hidden="true">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
