export interface TemplatePreset {
  id: string
  title: string
  subtitle: string
  icon: string
  category: string
  accent: string
  content: string
}

export const TEMPLATE_PRESETS: Record<string, TemplatePreset> = {
  'meeting-notes': {
    id: 'meeting-notes',
    title: 'Meeting Notes & Decisions',
    subtitle: 'Agenda, attendee check-in, key decisions, and action items',
    icon: '📝',
    category: 'Productivity',
    accent: '#C496A1',
    content: `<h1>Meeting Notes & Decisions</h1>
<p><strong>Date:</strong> <em>Today</em> &nbsp;|&nbsp; <strong>Facilitator:</strong> <em>Team Lead</em></p>
<blockquote>Collaborative review of project milestones, technical architecture, and upcoming deliverables.</blockquote>
<h2>Meeting Agenda</h2>
<ol>
  <li>Kickoff & Sprint Retrospective (10m)</li>
  <li>System Architecture & Latency Review (20m)</li>
  <li>Open Discussions & Q&A (15m)</li>
</ol>
<h2>Key Decisions Made</h2>
<ul>
  <li>Adopt distributed CRDT architecture for peer synchronization.</li>
  <li>Roll out offline-first IndexedDB persistence with automatic server merge.</li>
  <li>Standardize on editorial vintage typography across all editor tools.</li>
</ul>
<h2>Action Items & Ownership</h2>
<ul data-type="taskList">
  <li data-checked="false"><label><input type="checkbox"></label><div>Benchmark WebSocket relay under simulated high latency</div></li>
  <li data-checked="false"><label><input type="checkbox"></label><div>Verify PostgreSQL snapshot checkpoint schedules</div></li>
  <li data-checked="false"><label><input type="checkbox"></label><div>Share meeting recap and deliverables with leadership</div></li>
</ul>`,
  },

  'engineering-rfc': {
    id: 'engineering-rfc',
    title: 'Engineering Architecture RFC',
    subtitle: 'System design, tradeoffs, security considerations, and schemas',
    icon: '🚀',
    category: 'Engineering',
    accent: '#919D85',
    content: `<h1>RFC: Collaborative Real-Time Architecture</h1>
<p><strong>Status:</strong> Approved &nbsp;|&nbsp; <strong>Owner:</strong> Core Infrastructure Team</p>
<blockquote>A technical specification for low-latency collaborative document editing using CRDT operation trees.</blockquote>
<h2>1. Abstract & Motivation</h2>
<p>Distributed collaborative environments require instantaneous concurrent typing with guaranteed causal consistency, zero sequence-lock contention, and seamless offline resilience.</p>
<h2>2. Component Architecture</h2>
<table>
  <thead>
    <tr>
      <th>Layer</th>
      <th>Technology</th>
      <th>Responsibilities</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>CRDT Engine</td>
      <td>Yjs Document Trees</td>
      <td>Deterministic merge, causal ordering, character vectors</td>
    </tr>
    <tr>
      <td>Transport Relay</td>
      <td>WebSocket Relay (ws)</td>
      <td>Sub-50ms message broadcast without parsing overhead</td>
    </tr>
    <tr>
      <td>Local Cache</td>
      <td>IndexedDB (y-indexeddb)</td>
      <td>Instant cold start and offline document edits</td>
    </tr>
  </tbody>
</table>
<h2>3. Implementation Checklist</h2>
<ul data-type="taskList">
  <li data-checked="true"><label><input type="checkbox" checked="checked"></label><div>WebSocket awareness protocol for peer carets</div></li>
  <li data-checked="true"><label><input type="checkbox" checked="checked"></label><div>Debounced Postgres snapshot serialization (2000ms delay)</div></li>
  <li data-checked="false"><label><input type="checkbox"></label><div>End-to-end chaos test under network disruption</div></li>
</ul>`,
  },

  'sprint-roadmap': {
    id: 'sprint-roadmap',
    title: 'Quarterly Sprint Roadmap',
    subtitle: 'Milestones, key deliverables, team ownership, and timelines',
    icon: '🎯',
    category: 'Management',
    accent: '#8E88A3',
    content: `<h1>Quarterly Sprint Roadmap</h1>
<p><strong>Planning Cycle:</strong> Q3 Delivery &nbsp;|&nbsp; <strong>Cadence:</strong> 2-Week Sprints</p>
<blockquote>Strategic milestones, execution backlog, and cross-functional dependencies for the upcoming quarter.</blockquote>
<h2>Key Objectives & Deliverables</h2>
<table>
  <thead>
    <tr>
      <th>Initiative</th>
      <th>Lead</th>
      <th>Status</th>
      <th>Target Date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Collaborative Comments & Replies</td>
      <td>Frontend Team</td>
      <td>Active</td>
      <td>Sprint 1</td>
    </tr>
    <tr>
      <td>Version History & Time-Travel</td>
      <td>Backend Team</td>
      <td>Complete</td>
      <td>Sprint 2</td>
    </tr>
    <tr>
      <td>Document Outline Navigator</td>
      <td>Product Design</td>
      <td>Testing</td>
      <td>Sprint 3</td>
    </tr>
  </tbody>
</table>
<h2>Sprint Backlog Checklist</h2>
<ul data-type="taskList">
  <li data-checked="true"><label><input type="checkbox" checked="checked"></label><div>Complete peer review of CRDT transaction boundary tests</div></li>
  <li data-checked="false"><label><input type="checkbox"></label><div>Refine markdown export with formatting parity</div></li>
  <li data-checked="false"><label><input type="checkbox"></label><div>Conduct user testing session with external beta cohort</div></li>
</ul>`,
  },

  'product-spec': {
    id: 'product-spec',
    title: 'Product Design Spec',
    subtitle: 'Problem definition, user stories, mockups, and success metrics',
    icon: '✨',
    category: 'Design',
    accent: '#5D0D18',
    content: `<h1>Product Design Specification</h1>
<p><strong>Feature:</strong> Editorial Canvas Experience &nbsp;|&nbsp; <strong>Target Version:</strong> v1.0</p>
<blockquote>Design guidelines, user flows, and acceptance criteria for the distraction-free collaborative workspace.</blockquote>
<h2>1. Problem Overview & Vision</h2>
<p>Writers and knowledge workers deserve an elegant, stationery-inspired writing canvas that feels grounded and premium while offering state-of-the-art live multiplayer collaboration.</p>
<h2>2. Core User Stories</h2>
<ul>
  <li>As a writer, I want a warm, paper-textured reading canvas that minimizes eye fatigue.</li>
  <li>As a team member, I want to see live collaborator carets and presence tags as peers type.</li>
  <li>As an author, I want keyboard shortcuts (⌘K for actions, / for blocks) so I never have to leave the home row.</li>
</ul>
<h2>3. Quality & Polish Checklist</h2>
<ul data-type="taskList">
  <li data-checked="true"><label><input type="checkbox" checked="checked"></label><div>High-contrast dark mode with glowing cream typography</div></li>
  <li data-checked="true"><label><input type="checkbox" checked="checked"></label><div>Interactive checkboxes with satisfying visual feedback</div></li>
  <li data-checked="false"><label><input type="checkbox"></label><div>Customizable user avatar colors from the botanical palette</div></li>
</ul>`,
  },
}
