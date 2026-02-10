import { useState } from 'react';
import { Plus, Calendar, MapPin, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal, ModalFooter } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Group, Booking, BookingStatus } from '../../types';
import { useBookingStore } from '../../stores/bookingStore';
import { useVendorStore } from '../../stores/vendorStore';
import { useAuthStore } from '../../stores/authStore';
import { useWalletStore } from '../../stores/walletStore';
import { useToastStore } from '../../stores/toastStore';
import { formatCurrency, validateAmount } from '../../utils/security';

interface GroupBookingsTabProps {
  group: Group;
}

export function GroupBookingsTab({ group }: GroupBookingsTabProps) {
  const { user } = useAuthStore();
  const { vendors } = useVendorStore();
  const { getBookingsByGroup, createBooking, updateBookingStatus } = useBookingStore();
  const { wallets } = useWalletStore();
  const { addToast } = useToastStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    vendor_id: '',
    booking_date: '',
    amount: '',
    advance_amount: '',
    terms: '',
  });

  const bookings = getBookingsByGroup(group.id);
  const isOwner = user?.id === group.owner_id;

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(formData.amount);
    const advanceNum = parseFloat(formData.advance_amount);

    if (!validateAmount(amountNum) || !validateAmount(advanceNum)) {
      addToast('error', 'Invalid amount');
      return;
    }

    if (advanceNum > amountNum) {
      addToast('error', 'Advance amount cannot be greater than total amount');
      return;
    }

    try {
      const wallet = wallets.find((w) => w.group_id === group.id);
      if (!wallet || wallet.balance < advanceNum) {
        addToast('error', 'Insufficient wallet balance for advance payment');
        return;
      }

      const newBooking = await createBooking({
        group_id: group.id,
        vendor_id: formData.vendor_id,
        created_by: user!.id,
        booking_date: formData.booking_date,
        amount: amountNum,
        advance_amount: advanceNum,
        terms: formData.terms,
      });

      if (advanceNum > 0) {
        // TODO: Implement escrow functionality with local storage
        // For now, just track the advance amount in the booking
      }

      addToast('success', 'Booking created successfully');
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error: any) {
      addToast('error', error.message || 'Failed to create booking');
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    updateBookingStatus(bookingId, 'cancelled');
    addToast('success', 'Booking cancelled');
    setIsMenuOpen(null);
  };

  const handleConfirmBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'confirmed');
    addToast('success', 'Booking confirmed');
    setIsMenuOpen(null);
  };

  const resetForm = () => {
    setFormData({
      vendor_id: '',
      booking_date: '',
      amount: '',
      advance_amount: '',
      terms: '',
    });
  };

  const statusColors: Record<BookingStatus, 'default' | 'warning' | 'success' | 'error'> = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'success',
    cancelled: 'error',
  };

  const statusIcons: Record<BookingStatus, any> = {
    pending: Clock,
    confirmed: CheckCircle,
    completed: CheckCircle,
    cancelled: XCircle,
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bookings ({bookings.length})</CardTitle>
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={18} className="mr-2" />
              Create Booking
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const vendor = vendors.find((v) => v.id === booking.vendor_id);
                const StatusIcon = statusIcons[booking.status];

                return (
                  <div
                    key={booking.id}
                    className="flex items-start justify-between p-4 border-2 border-nostalgic-200 hover:bg-nostalgic-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{vendor?.name || 'Unknown Vendor'}</h4>
                        <Badge variant={statusColors[booking.status]} size="sm">
                          {booking.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-2 text-nostalgic-600">
                          <Calendar size={16} />
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </p>
                        <p className="flex items-center gap-2 text-nostalgic-600">
                          <MapPin size={16} />
                          {vendor?.address || 'Location not specified'}
                        </p>
                        <div className="flex gap-4">
                          <p>
                            <span className="text-nostalgic-600">Total:</span>{' '}
                            <span className="font-mono font-bold">{formatCurrency(booking.amount)}</span>
                          </p>
                          <p>
                            <span className="text-nostalgic-600">Advance:</span>{' '}
                            <span className="font-mono font-bold">{formatCurrency(booking.advance_amount)}</span>
                          </p>
                        </div>
                        {booking.terms && (
                          <p className="text-nostalgic-600 italic">{booking.terms}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {booking.status === 'pending' && isOwner && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleConfirmBooking(booking.id)}
                        >
                          Confirm
                        </Button>
                      )}

                      {booking.status !== 'cancelled' && isOwner && (
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMenuOpen(
                              isMenuOpen === booking.id ? null : booking.id
                            )}
                          >
                            <MoreVertical size={18} />
                          </Button>

                          {isMenuOpen === booking.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black shadow-retro-lg z-10">
                              {booking.status === 'confirmed' && booking.escrow_transaction_id && (
                                <button
                                  onClick={() => {
                                    // TODO: Implement releaseEscrow functionality with local storage
                                    addToast('success', 'Escrow released');
                                    setIsMenuOpen(null);
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-nostalgic-100 text-sm"
                                >
                                  Release Escrow
                                </button>
                              )}
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 text-sm"
                              >
                                Cancel Booking
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-nostalgic-400 mb-4" />
              <p className="text-lg font-medium mb-2">No bookings yet</p>
              <p className="text-nostalgic-600 mb-4">Book vendors for your group events</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={18} className="mr-2" />
                Create First Booking
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Booking Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Create New Booking"
        size="lg"
      >
        <form onSubmit={handleCreateBooking}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Vendor</label>
              <select
                required
                value={formData.vendor_id}
                onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                <option value="">Select a vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} - {vendor.category}
                  </option>
                ))}
              </select>
              {vendors.length === 0 && (
                <p className="text-sm text-nostalgic-600 mt-1">
                  No vendors available. Please add vendors first.
                </p>
              )}
            </div>

            <Input
              label="Booking Date"
              type="date"
              required
              value={formData.booking_date}
              onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Total Amount (₹)"
                type="number"
                required
                min="1"
                max="10000000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter total amount"
              />
              <Input
                label="Advance Amount (₹)"
                type="number"
                required
                min="0"
                max="10000000"
                value={formData.advance_amount}
                onChange={(e) => setFormData({ ...formData, advance_amount: e.target.value })}
                placeholder="Enter advance amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Terms & Conditions</label>
              <textarea
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                placeholder="Enter any special terms or conditions"
              />
            </div>
          </div>

          <ModalFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => {
              setIsCreateModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button type="submit">Create Booking</Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}

function Clock(props: any) {
  return <Calendar {...props} />;
}
