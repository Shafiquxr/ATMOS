import { useState } from 'react';
import { Plus, Building2, Star, Phone, Mail, MapPin, MoreVertical, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal, ModalFooter } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Group, Vendor, VendorCategory } from '../../types';
import { useVendorStore } from '../../stores/vendorStore';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import { sanitizeInput, sanitizePhoneNumber } from '../../utils/security';

interface GroupVendorsTabProps {
  group: Group;
}

export function GroupVendorsTab({ group }: GroupVendorsTabProps) {
  const { user } = useAuthStore();
  const { vendors, createVendor, updateVendor, deleteVendor, addReview } = useVendorStore();
  const { addToast } = useToastStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<VendorCategory | 'all'>('all');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'other' as VendorCategory,
    description: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    address: '',
    price_range: 'moderate' as const,
  });

  const filteredVendors = vendors.filter((v) =>
    filterCategory === 'all' || v.category === filterCategory
  );

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      createVendor({
        name: sanitizeInput(formData.name),
        category: formData.category,
        description: sanitizeInput(formData.description),
        contact_name: sanitizeInput(formData.contact_name),
        contact_phone: sanitizePhoneNumber(formData.contact_phone),
        contact_email: formData.contact_email.toLowerCase(),
        address: sanitizeInput(formData.address),
        price_range: formData.price_range,
        rating: 0,
        total_reviews: 0,
      });

      addToast('success', 'Vendor added successfully');
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      addToast('error', 'Failed to add vendor');
    }
  };

  const handleDeleteVendor = (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) {
      return;
    }

    deleteVendor(vendorId);
    addToast('success', 'Vendor deleted');
    setIsMenuOpen(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVendor) return;

    try {
      addReview({
        vendor_id: selectedVendor.id,
        booking_id: '',
        user_id: user!.id,
        rating: reviewRating,
        review: reviewText,
      });

      addToast('success', 'Review submitted');
      setIsReviewModalOpen(false);
      setReviewRating(5);
      setReviewText('');
      setSelectedVendor(null);
    } catch (error) {
      addToast('error', 'Failed to submit review');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'other',
      description: '',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      address: '',
      price_range: 'moderate',
    });
  };

  const categoryLabels: Record<VendorCategory, string> = {
    accommodation: 'Accommodation',
    transport: 'Transport',
    catering: 'Catering',
    equipment: 'Equipment',
    venue: 'Venue',
    other: 'Other',
  };

  const priceRangeColors: Record<string, string> = {
    budget: 'text-green-600',
    moderate: 'text-amber-600',
    premium: 'text-purple-600',
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Vendors ({vendors.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Filter size={18} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as VendorCategory | 'all')}
                className="px-3 py-1.5 border-2 border-black text-sm"
              >
                <option value="all">All Categories</option>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={18} className="mr-2" />
                Add Vendor
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredVendors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="p-4 border-2 border-nostalgic-200 hover:border-black transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-lg">{vendor.name}</h4>
                      <Badge size="sm">{categoryLabels[vendor.category]}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-amber-500 fill-amber-500" />
                        <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                      </div>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsMenuOpen(
                            isMenuOpen === vendor.id ? null : vendor.id
                          )}
                        >
                          <MoreVertical size={16} />
                        </Button>

                        {isMenuOpen === vendor.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black shadow-retro-lg z-10">
                            <button
                              onClick={() => {
                                setSelectedVendor(vendor);
                                setIsReviewModalOpen(true);
                                setIsMenuOpen(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-nostalgic-100 text-sm"
                            >
                              Add Review
                            </button>
                            <button
                              onClick={() => handleDeleteVendor(vendor.id)}
                              className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 text-sm"
                            >
                              Delete Vendor
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {vendor.description && (
                    <p className="text-sm text-nostalgic-600 mb-3">{vendor.description}</p>
                  )}

                  <div className="space-y-1 text-sm text-nostalgic-600">
                    {vendor.contact_name && (
                      <p className="flex items-center gap-2">
                        <Building2 size={14} />
                        {vendor.contact_name}
                      </p>
                    )}
                    {vendor.contact_phone && (
                      <p className="flex items-center gap-2">
                        <Phone size={14} />
                        {vendor.contact_phone}
                      </p>
                    )}
                    {vendor.contact_email && (
                      <p className="flex items-center gap-2">
                        <Mail size={14} />
                        {vendor.contact_email}
                      </p>
                    )}
                    {vendor.address && (
                      <p className="flex items-center gap-2">
                        <MapPin size={14} />
                        {vendor.address}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-nostalgic-200">
                    <p className="text-sm">
                      <span className="text-nostalgic-600">Price Range:</span>{' '}
                      <span className={`font-medium capitalize ${priceRangeColors[vendor.price_range || '']}`}>
                        {vendor.price_range}
                      </span>
                    </p>
                    <p className="text-sm text-nostalgic-600">
                      {vendor.total_reviews} review{vendor.total_reviews !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 size={48} className="mx-auto text-nostalgic-400 mb-4" />
              <p className="text-lg font-medium mb-2">No vendors found</p>
              <p className="text-nostalgic-600 mb-4">Add vendors to manage your bookings</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={18} className="mr-2" />
                Add First Vendor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Vendor Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Add New Vendor"
        size="lg"
      >
        <form onSubmit={handleCreateVendor}>
          <div className="space-y-4">
            <Input
              label="Vendor Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter vendor name"
            />

            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as VendorCategory })}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                placeholder="Describe the vendor's services"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Contact Name"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                placeholder="Contact person"
              />
              <Input
                label="Contact Phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>

            <Input
              label="Contact Email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="Email address"
            />

            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Vendor address"
            />

            <div>
              <label className="block text-sm font-medium mb-1.5">Price Range</label>
              <select
                value={formData.price_range}
                onChange={(e) => setFormData({ ...formData, price_range: e.target.value as any })}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                <option value="budget">Budget</option>
                <option value="moderate">Moderate</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>

          <ModalFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => {
              setIsCreateModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button type="submit">Add Vendor</Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setReviewRating(5);
          setReviewText('');
          setSelectedVendor(null);
        }}
        title={`Review ${selectedVendor?.name}`}
      >
        <form onSubmit={handleSubmitReview}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="text-3xl transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={star <= reviewRating ? 'text-amber-500 fill-amber-500' : 'text-nostalgic-300'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Your Review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                placeholder="Share your experience with this vendor"
                required
              />
            </div>
          </div>

          <ModalFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => {
              setIsReviewModalOpen(false);
              setReviewRating(5);
              setReviewText('');
              setSelectedVendor(null);
            }}>
              Cancel
            </Button>
            <Button type="submit">Submit Review</Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
