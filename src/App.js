import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Edit3, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

const UI_THEME = { bg: 'bg-[#0a0a0a]', surface: 'bg-[#151515]', accent: 'text-[#ffcc00]', accentBg: 'bg-[#ffcc00]', border: 'border-[#ffcc00]/20', text: 'text-white', rounded: 'rounded-2xl' };

const useGlitchText = (text, trigger) => {
  const [displayText, setDisplayText] = useState(text);
  useEffect(() => {
    let iteration = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*@$";
    const interval = setInterval(() => {
      setDisplayText(prev => text.split("").map((char, index) => index < iteration ? text[index] : chars[Math.floor(Math.random() * chars.length)]).join(""));
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1/2;
    }, 20);
    return () => clearInterval(interval);
  }, [text, trigger]);
  return displayText;
};

const SortableItem = ({ id, item, onDelete, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const glitchTitle = useGlitchText(item.title, item.id);
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0 : 1 };
  return (
    <div ref={setNodeRef} style={style} className={`relative group border ${UI_THEME.border} mb-2 ${UI_THEME.surface} p-5 flex items-center gap-6 overflow-hidden transition-all hover:bg-[#222] ${UI_THEME.rounded}`}>
      <div className="flex flex-col items-center opacity-30 group-hover:opacity-100">
        <span className="text-[7px] font-mono text-[#ffcc00] mb-2 leading-none uppercase">REF_{id}</span>
        <div {...attributes} {...listeners} className="cursor-grab p-1"><GripVertical size={14} className="text-[#ffcc00]" /></div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className={`text-[10px] text-black font-black ${UI_THEME.accentBg} px-1.5 py-0.5 rounded-md`}>{String(item.index + 1).padStart(2, '0')}</span>
          <h3 className="font-bold text-white truncate text-xs tracking-[0.2em] uppercase">{glitchTitle}</h3>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono text-[#ffcc00]/40 uppercase tracking-widest">
          <span className="flex items-center gap-1"><Clock size={10} /> {item.hours || '0'}H {item.minutes || '0'}M</span>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
        <button onClick={() => onEdit(item)} className="p-2 border border-[#ffcc00]/20 hover:bg-[#ffcc00] hover:text-black rounded-lg"><Edit3 size={12} /></button>
        <button onClick={() => onDelete(id)} className="p-2 border border-red-900/40 hover:bg-red-600 rounded-lg"><Trash2 size={12} /></button>
      </div>
    </div>
  );
};

export default function App() {
  const [items, setItems] = useState([
    { id: '401', title: 'SYSTEM_BOOT_SEQUENCE', hours: '0', minutes: '45' },
    { id: '402', title: 'FIELD_SURVEY_ALPHA', hours: '2', minutes: '30' }
  ]);
  const [newItem, setNewItem] = useState({ title: '', hours: '', minutes: '' });
  const [activeId, setActiveId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 100);
    return () => clearInterval(timer);
  }, []);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const handleDragStart = (e) => setActiveId(e.active.id);
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const addItem = (e) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;
    setItems(prev => [...prev, { ...newItem, id: Math.random().toString(36).substr(2, 4) }]);
    setNewItem({ title: '', hours: '', minutes: '' });
  };

  return (
    <div className={`min-h-screen ${UI_THEME.bg} text-white font-mono p-6 md:p-20 flex flex-col items-center`}>
      <div className="w-full max-w-2xl z-10">
        <header className="mb-16 border-b-4 border-[#ffcc00] pb-10 flex justify-between items-end relative">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <RefreshCw size={12} className="animate-spin text-[#ffcc00]/50" />
              <span className="text-[9px] font-bold tracking-[0.5em] text-[#ffcc00]/40 uppercase">Awaiting...</span>
            </div>
            <h1 className="text-6xl font-black text-[#ffcc00] tracking-tighter uppercase italic leading-none">CHRONO WEAPONS</h1>
          </div>
        </header>

        <form onSubmit={addItem} className="mb-12 flex flex-col md:flex-row gap-2 bg-[#ffcc00]/10 p-2 border border-[#ffcc00]/30 rounded-2xl">
          <input className="flex-1 bg-black p-5 rounded-2xl text-white text-xs" placeholder="ENTER NEW COMMAND..." value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
          <button type="submit" className="bg-[#ffcc00] text-black px-10 py-5 text-[10px] font-black rounded-2xl">EXECUTE</button>
        </form>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item, index) => (
                <SortableItem key={item.id} id={item.id} item={{ ...item, index }} onDelete={(id) => setItems(prev => prev.filter(i => i.id !== id))} onEdit={setEditingItem} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4">
          <div className="bg-[#151515] border-2 border-[#ffcc00] p-8 w-full max-w-sm rounded-2xl">
            <h2 className="text-xs font-black mb-6 text-[#ffcc00] flex items-center gap-2"><AlertTriangle size={14} /> Protocol_Mod</h2>
            <button onClick={() => setEditingItem(null)} className="w-full py-4 bg-[#ffcc00] text-black text-[10px] font-black rounded-xl">CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
}
