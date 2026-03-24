import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const assignmentsData = [
  {
    category: "Presentation Templates",
    tasks: [
      { name: "Opening, Closing", size: "1920 x 1080 px" },
      { name: "Announcement of Winners", size: "1920 x 1080 px" }
    ],
    assignee: "TBD"
  },
  {
    category: "Tarpauline Layouts",
    tasks: [
      { name: "Event Tarp", size: "Various Sizes" },
      { name: "Regional Street Banner", size: "TBD" },
      { name: "Regional Long Banner", size: "TBD" },
      { name: "Welcome Tarps", size: "TBD" }
    ],
    assignee: "TBD"
  },
  {
    category: "Social Media Pubmats",
    tasks: [
      { name: "Event Announcements", size: "1080 x 1080 px (Square), 1080 x 1920 px (Story)" },
      { name: "Countdown", size: "1080 x 1080 px (Square), 1080 x 1920 px (Story)" },
      { name: "Winners", size: "1080 x 1080 px (Square), 1080 x 1920 px (Story)" }
    ],
    assignee: "TBD"
  },
  {
    category: "Wayfinding Signage",
    tasks: [
      { name: "VIP lounge, toilets, billeting quarters", size: "TBD" }
    ],
    assignee: "TBD"
  },
  {
    category: "Motion",
    tasks: [
      { name: "Digital background for LED", size: "1920 x 1080 px" },
      { name: "Timer with Contest Number on Side", size: "1920 x 1080 px" },
      { name: "Intro/Extro Logo Animation", size: "1920 x 1080 px" }
    ],
    assignee: "TBD"
  },
  {
    category: "Zoom Background",
    tasks: [
      { name: "Opening and Closing", size: "1920 x 1080 px" }
    ],
    assignee: "TBD"
  },
  {
    category: "Photo Op Wall Design",
    tasks: [
      { name: "Wall Design Mockup", size: "TBD" }
    ],
    assignee: "TBD"
  },
  {
    category: "Official Program",
    tasks: [
      { name: "Program Booklet", size: "TBD" }
    ],
    assignee: "TBD"
  },
  {
    category: "Merchandise design",
    tasks: [
      { name: "TShirt", size: "TBD" },
      { name: "Tote Bag", size: "TBD" },
      { name: "Lanyards", size: "TBD" },
      { name: "ID Cards", size: "TBD" }
    ],
    assignee: "TBD"
  }
];

const flatTasks = assignmentsData.flatMap((group, groupIdx) => 
  group.tasks.map((taskItem, taskIdx) => ({
    id: `${groupIdx}-${taskIdx}`,
    category: group.category,
    task: taskItem.name,
    size: taskItem.size,
    assignee: group.assignee,
    checked: false
  }))
);

export function Assignments() {
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
                return (
                  <TableRow 
                      key={item.id} 
                      className="border-b border-[rgba(56,56,49,0.05)]"
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
                       {item.task}
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
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
