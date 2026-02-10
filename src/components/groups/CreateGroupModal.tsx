import { useState } from 'react';
import { Modal, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToastStore } from '../../stores/toastStore';
import { useGroupStore } from '../../stores/groupStore';
import { useAuthStore } from '../../stores/authStore';
import { GroupCategory } from '../../types';
import { sanitizeInput } from '../../utils/security';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const { addToast } = useToastStore();
  const { createGroup } = useGroupStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'other' as GroupCategory,
    start_date: '',
    end_date: '',
    location: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      addToast('error', 'Group name is required');
      return;
    }

    setIsLoading(true);

    try {
      await createGroup({
        name: sanitizeInput(formData.name),
        description: sanitizeInput(formData.description),
        category: formData.category,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        location: sanitizeInput(formData.location),
      });

      addToast('success', 'Group created successfully!');

      setFormData({
        name: '',
        description: '',
        category: 'other',
        start_date: '',
        end_date: '',
        location: '',
      });

      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      addToast('error', 'Failed to create group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Group" size="lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Group Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter group name"
          />

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all"
              placeholder="What is this group about?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as GroupCategory })}
              className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all"
            >
              <option value="trip">Trip</option>
              <option value="event">Event</option>
              <option value="project">Project</option>
              <option value="club">Club</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />

            <Input
              label="End Date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Where is this happening?"
          />
        </div>

        <ModalFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Group
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
