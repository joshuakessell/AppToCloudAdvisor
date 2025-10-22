import { PlaybookViewer } from '../PlaybookViewer';

export default function PlaybookViewerExample() {
  const mockPlaybook = `---
- name: Deploy Application to Cloud
  hosts: all
  become: yes
  
  vars:
    app_name: "my-application"
    app_port: 3000
    
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes
        
    - name: Install Node.js
      apt:
        name: nodejs
        state: present
        
    - name: Install npm
      apt:
        name: npm
        state: present
        
    - name: Install PostgreSQL
      apt:
        name: postgresql
        state: present
        
    - name: Create application directory
      file:
        path: /opt/{{ app_name }}
        state: directory
        mode: '0755'
        
    - name: Deploy application
      copy:
        src: ../dist/
        dest: /opt/{{ app_name }}/
        
    - name: Install dependencies
      npm:
        path: /opt/{{ app_name }}
        state: present`;

  return (
    <div className="p-8">
      <PlaybookViewer 
        playbook={mockPlaybook}
        onDeploy={() => console.log('Deploy clicked')}
      />
    </div>
  );
}
