import { useState } from "react";
import type { Checklist, TripOption } from "../types";

interface ChecklistManagerProps {
  checklists: Checklist[];
  selectedTrip: TripOption | null;
  onChange: (checklists: Checklist[]) => void;
}

export function ChecklistManager({
  checklists,
  selectedTrip,
  onChange,
}: ChecklistManagerProps) {
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [newItems, setNewItems] = useState<Record<string, string>>({});

  const recommendedIds = selectedTrip?.checklistIds ?? [];
  const orderedChecklists = [
    ...checklists.filter((checklist) => recommendedIds.includes(checklist.id)),
    ...checklists.filter((checklist) => !recommendedIds.includes(checklist.id)),
  ];

  const updateChecklist = (updatedChecklist: Checklist) => {
    onChange(
      checklists.map((checklist) =>
        checklist.id === updatedChecklist.id ? updatedChecklist : checklist,
      ),
    );
  };

  const toggleItem = (checklistId: string, itemId: string) => {
    const checklist = checklists.find((current) => current.id === checklistId);
    if (!checklist) {
      return;
    }

    updateChecklist({
      ...checklist,
      items: checklist.items.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item,
      ),
    });
  };

  const addItem = (checklist: Checklist) => {
    const title = newItems[checklist.id]?.trim();
    if (!title) {
      return;
    }

    updateChecklist({
      ...checklist,
      items: [
        ...checklist.items,
        {
          id: `${checklist.id}-${Date.now()}`,
          title,
          checked: false,
        },
      ],
    });
    setNewItems({ ...newItems, [checklist.id]: "" });
  };

  const editItem = (checklist: Checklist, itemId: string) => {
    const item = checklist.items.find((current) => current.id === itemId);
    if (!item) {
      return;
    }

    const nextTitle = window.prompt("Изменить пункт", item.title)?.trim();
    if (!nextTitle) {
      return;
    }

    updateChecklist({
      ...checklist,
      items: checklist.items.map((current) =>
        current.id === itemId ? { ...current, title: nextTitle } : current,
      ),
    });
  };

  const deleteItem = (checklist: Checklist, itemId: string) => {
    updateChecklist({
      ...checklist,
      items: checklist.items.filter((item) => item.id !== itemId),
    });
  };

  const renameChecklist = (checklist: Checklist) => {
    const nextTitle = window.prompt("Название чек-листа", checklist.title)?.trim();
    if (!nextTitle) {
      return;
    }

    updateChecklist({ ...checklist, title: nextTitle });
  };

  const createChecklist = () => {
    const title = newChecklistTitle.trim();
    if (!title) {
      return;
    }

    onChange([
      ...checklists,
      {
        id: `custom-${Date.now()}`,
        title,
        description: "Пользовательский чек-лист",
        items: [],
      },
    ]);
    setNewChecklistTitle("");
  };

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Чек-листы</div>
          <h1>Что взять с собой</h1>
        </div>
      </div>
      {selectedTrip ? (
        <p className="muted">
          Для плана "{selectedTrip.title}" первыми показаны рекомендованные списки.
        </p>
      ) : (
        <p className="muted">Выберите поездку, чтобы увидеть рекомендованные списки выше остальных.</p>
      )}

      <div className="inline-form">
        <input
          aria-label="Название нового чек-листа"
          onChange={(event) => setNewChecklistTitle(event.target.value)}
          placeholder="Новый чек-лист"
          value={newChecklistTitle}
        />
        <button className="primary-button" onClick={createChecklist} type="button">
          Создать
        </button>
      </div>

      <div className="checklist-stack">
        {orderedChecklists.map((checklist) => (
          <article className="checklist-card" key={checklist.id}>
            <header>
              <div>
                <span>
                  {recommendedIds.includes(checklist.id) ? "Рекомендовано" : "Шаблон"}
                </span>
                <h2>{checklist.title}</h2>
                <p>{checklist.description}</p>
              </div>
              <button
                className="icon-button"
                onClick={() => renameChecklist(checklist)}
                type="button"
              >
                Изм.
              </button>
            </header>

            <div className="checklist-items">
              {checklist.items.map((item) => (
                <label className={item.checked ? "check-item is-done" : "check-item"} key={item.id}>
                  <input
                    checked={item.checked}
                    onChange={() => toggleItem(checklist.id, item.id)}
                    type="checkbox"
                  />
                  <span>{item.title}</span>
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      editItem(checklist, item.id);
                    }}
                    type="button"
                  >
                    ред.
                  </button>
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      deleteItem(checklist, item.id);
                    }}
                    type="button"
                  >
                    удалить
                  </button>
                </label>
              ))}
            </div>

            <div className="inline-form">
              <input
                aria-label={`Добавить пункт в ${checklist.title}`}
                onChange={(event) =>
                  setNewItems({ ...newItems, [checklist.id]: event.target.value })
                }
                placeholder="Добавить пункт"
                value={newItems[checklist.id] ?? ""}
              />
              <button className="ghost-button" onClick={() => addItem(checklist)} type="button">
                Добавить
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
