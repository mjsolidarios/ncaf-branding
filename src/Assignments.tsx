import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { eventTarpsData } from './data/eventTarps';

const assignmentsData = [
  {
    category: "Presentation Templates",
    tasks: [
      { name: "Opening, Closing", size: "1920 x 1080 px", assignee: "Quela Magbanua, King Rodrigo, Glenn Gabriel Angelo Dipon" },
      { name: "Announcement of Winners", size: "1920 x 1080 px", assignee: "Quela Magbanua, King Rodrigo, Glenn Gabriel Angelo Dipon" }
    ]
  },
  {
    category: "Tarpauline Layouts",
    tasks: [
      { name: "Event Tarp", size: "4' x 6'", assignee: "Francis (Overseer) with Link Team" },
      { name: "Regional Street Banner", size: "4' x 10'", assignee: "Julia Yzzabel Roa, Nathe Rey Amar, Lindsay Pillora" },
      { name: "Regional Long Banner", size: "4' x 10'", assignee: "Julia Yzzabel Roa, Nathe Rey Amar, Lindsay Pillora" },
      { name: "Welcome Tarps", size: "4' x 10'", assignee: "Yunize (Overseer), James Remegio, SC Team" }
    ]
  },
  {
    category: "Social Media Pubmats",
    tasks: [
      { name: "Event Announcements", size: "1080 x 1080 px (Square), 1080 x 1920 px (Story)", assignee: "Sir Mark" },
      { name: "Countdown", size: "1080 x 1080 px (Square), 1080 x 1920 px (Story)", assignee: "Sir Mark" },
      { name: "Winners", size: "1080 x 1080 px (Square), 1080 x 1920 px (Story)", assignee: "Sir Mark" }
    ]
  },
  {
    category: "Wayfinding Signage",
    tasks: [
      { name: "VIP lounge, toilets, billeting quarters", size: "TBD", assignee: "Julia Yzzabel Roa, Nathe Rey Amar, Lindsay Pillora" }
    ]
  },
  {
    category: "Motion",
    tasks: [
      { name: "Digital background for LED", size: "1920 x 1080 px", assignee: "Ceejay Ledesma and Team" },
      { name: "Timer with Contest Number on Side", size: "1920 x 1080 px", assignee: "Ceejay Ledesma and Team" },
      { name: "Intro/Extro Logo Animation", size: "1920 x 1080 px", assignee: "Ceejay Ledesma and Team" }
    ]
  },
  {
    category: "Zoom Background",
    tasks: [
      { name: "Opening and Closing", size: "1920 x 1080 px", assignee: "Link Team" }
    ]
  },
  {
    category: "Photo Op Wall Design",
    tasks: [
      { name: "Wall Design Mockup", size: "TBD", assignee: "Quela Magbanua, King Rodrigo, Glenn Gabriel Angelo Dipon" }
    ]
  },
  {
    category: "Official Program",
    tasks: [
      { name: "Program Booklet", size: "TBD", assignee: "Marey" }
    ]
  },
  {
    category: "Merchandise design",
    tasks: [
      { name: "TShirt", size: "TBD", assignee: "Mel Tatud" },
      { name: "Tote Bag", size: "TBD", assignee: "TBD" },
      { name: "Lanyards", size: "TBD", assignee: "TBD" },
      { name: "ID Cards", size: "TBD", assignee: "TBD" }
    ]
  }
];

const flatTasks = assignmentsData.flatMap((group, groupIdx) =>
  group.tasks.map((taskItem, taskIdx) => ({
    id: `${groupIdx}-${taskIdx}`,
    category: group.category,
    task: taskItem.name,
    size: taskItem.size,
    assignee: taskItem.assignee,
    checked: false
  }))
);

export function Assignments() {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <section id="assignments" className="section reveal" style={{ paddingTop: '6rem' }}>
      <div className="container">
        <div className="section-intro">
          <p className="section-kicker">Task Tracking</p>
          <h2>Creatives Assignments</h2>
          <p className="section-lead">
            A checklist of all creative deliverables and their assignees for NCAF 2026.
          </p>
        </div>

        <div style={{ marginTop: '3.5rem' }} className="glass-panel p-2 md:p-6 rounded-2xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[rgba(56,56,49,0.1)] hover:bg-transparent">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="font-bold text-[var(--primary)] uppercase tracking-wide text-xs">Category</TableHead>
                <TableHead className="font-bold text-[var(--primary)] uppercase tracking-wide text-xs">Deliverable</TableHead>
                <TableHead className="font-bold text-[var(--primary)] uppercase tracking-wide text-xs">Size</TableHead>
                <TableHead className="text-right font-bold text-[var(--primary)] uppercase tracking-wide text-xs">Assignee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flatTasks.map((item) => {
                const isChecked = item.checked;
                const isEventTarp = item.task === "Event Tarp";
                const isExpanded = expandedRows[item.id] || false;

                return (
                  <React.Fragment key={item.id}>
                    <TableRow
                      className={`border-b border-[rgba(56,56,49,0.05)] ${isEventTarp ? 'cursor-pointer hover:bg-[rgba(64,110,81,0.03)]' : ''}`}
                      onClick={() => isEventTarp && toggleRow(item.id)}
                    >
                      <TableCell>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: `2px solid ${isChecked ? 'var(--primary)' : 'rgba(56,56,49,0.3)'}`,
                          backgroundColor: isChecked ? 'var(--primary)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {isChecked && (
                            <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={`font-medium text-[var(--tertiary)] ${isChecked ? 'opacity-40 line-through' : ''}`}>
                        {item.category}
                      </TableCell>
                      <TableCell className={`text-[var(--on-surface-soft)] ${isChecked ? 'opacity-40 line-through' : ''}`}>
                        <div className="flex items-center gap-2">
                          {item.task}
                          {isEventTarp && (
                            <svg className={`text-[var(--primary)] transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={`text-[var(--on-surface-soft)] ${isChecked ? 'opacity-40 line-through' : ''}`}>
                        {item.size}
                      </TableCell>
                      <TableCell className={`text-right ${isChecked ? 'opacity-40' : ''}`}>
                        <span className="text-[0.65rem] font-bold uppercase tracking-widest px-3 py-1 bg-[rgba(64,110,81,0.08)] text-[var(--primary)] rounded-full border border-[rgba(64,110,81,0.15)]">
                          {item.assignee}
                        </span>
                      </TableCell>
                    </TableRow>

                    {isEventTarp && isExpanded && (
                      <TableRow className="bg-[rgba(64,110,81,0.02)]">
                        <TableCell colSpan={5} className="p-0 border-b border-[rgba(56,56,49,0.1)]">
                          <div className="p-0 md:p-2 border-l-2 border-[rgba(64,110,81,0.2)] ml-4">
                            <div className="overflow-x-auto">
                              <Table className="bg-transparent">
                                <TableHeader>
                                  <TableRow className="bg-[rgba(56,56,49,0.02)]">
                                    <TableHead className="w-[30px]"></TableHead>
                                    <TableHead className="text-xs font-bold text-[rgba(56,56,49,0.6)] uppercase tracking-wider">Date</TableHead>
                                    <TableHead className="text-xs font-bold text-[rgba(56,56,49,0.6)] uppercase tracking-wider">Time</TableHead>
                                    <TableHead className="text-xs font-bold text-[rgba(56,56,49,0.6)] uppercase tracking-wider">Event Name</TableHead>
                                    <TableHead className="text-xs font-bold text-[rgba(56,56,49,0.6)] uppercase tracking-wider">Venue</TableHead>
                                    <TableHead className="text-xs font-bold text-[rgba(56,56,49,0.6)] uppercase tracking-wider">In-Charge</TableHead>
                                    <TableHead className="text-xs font-bold text-[rgba(56,56,49,0.6)] uppercase tracking-wider text-right">Assignee</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {eventTarpsData.map((evt) => (
                                    <TableRow key={evt.id} className="text-xs border-b border-[rgba(56,56,49,0.05)] hover:bg-[rgba(64,110,81,0.03)]">
                                      <TableCell>
                                        <div style={{
                                          width: '14px',
                                          height: '14px',
                                          borderRadius: '3px',
                                          border: `1.5px solid rgba(56,56,49,0.3)`,
                                          backgroundColor: 'transparent',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}></div>
                                      </TableCell>
                                      <TableCell className="font-semibold whitespace-nowrap text-[rgba(56,56,49,0.8)]">{evt.date}</TableCell>
                                      <TableCell className="whitespace-nowrap text-[rgba(56,56,49,0.6)]">{evt.time}</TableCell>
                                      <TableCell className="text-[var(--tertiary)] font-bold min-w-[200px] whitespace-normal break-words">{evt.event}</TableCell>
                                      <TableCell className="text-[var(--on-surface-soft)] font-medium min-w-[220px] max-w-[300px] leading-relaxed whitespace-normal break-words">{evt.venue || '-'}</TableCell>
                                      <TableCell className="text-[var(--on-surface-soft)] leading-relaxed min-w-[180px] whitespace-normal break-words">{evt.inCharge}</TableCell>
                                      <TableCell className="text-right">
                                        <span className="text-[0.65rem] font-bold uppercase tracking-widest px-3 py-1 bg-[rgba(64,110,81,0.08)] text-[var(--primary)] rounded-full border border-[rgba(64,110,81,0.15)] whitespace-nowrap">
                                          {evt.assignee}
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
