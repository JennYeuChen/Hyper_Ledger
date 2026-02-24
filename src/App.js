import React, { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, RefreshCw } from 'lucide-react';

const SortableItem = ({ id, title }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="p-4 mb-2 bg-[#151515] border border-[#ffcc00]/20 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab"><GripVertical size={16} className="text-[#ffcc00]" /></div>
        <span className="text-sm font-bold text-white uppercase">{title}</span>
      </div>
    </div>
  );
};

export default function App() {
  const [items, setItems] = useState([
    { id: '1', title: 'SYSTEM_BOOT' },
    { id: '2', title: 'CORE_SYNC' }
  ]);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-10 flex flex-col items-center font-mono">
      <header className="w-full max-w-md border-b-2 border-[#ffcc00] pb-4 mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-black text-[#ffcc00] italic">CHRONO WEAPONS</h1>
        <RefreshCw size={16} className="text-[#ffcc00] animate-spin" />
      </header>
      <div className="w-full max-w-md">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map((item) => <SortableItem key={item.id} id={item.id} title={item.title} />)}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
