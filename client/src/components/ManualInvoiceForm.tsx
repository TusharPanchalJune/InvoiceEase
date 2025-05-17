import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InvoiceInput } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerContact: z.string().min(1, "Customer contact is required"),
  description: z.string().min(1, "Payment description is required"),
  amountPaid: z.coerce.number()
    .min(0, "Amount paid must be 0 or greater"),
  dueAmount: z.coerce.number()
    .min(0, "Due amount must be 0 or greater")
});

type FormSchema = z.infer<typeof formSchema>;

interface ManualInvoiceFormProps {
  isVisible: boolean;
  handleSubmit: (data: InvoiceInput) => Promise<void>;
}

const ManualInvoiceForm: React.FC<ManualInvoiceFormProps> = ({ isVisible, handleSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerContact: "",
      description: "",
      amountPaid: 0,
      dueAmount: 0
    }
  });

  if (!isVisible) return null;

  const onSubmit = async (data: FormSchema) => {
    setIsSubmitting(true);
    try {
      await handleSubmit({
        ...data,
        amountPaid: data.amountPaid.toFixed(2),
        dueAmount: data.dueAmount.toFixed(2)
      });
      form.reset();
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create Invoice Manually</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="customerContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment For</FormLabel>
                  <FormControl>
                    <Input placeholder="Description of goods or services" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amountPaid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Paid</FormLabel>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          step="0.01" 
                          min="0" 
                          className="pl-7" 
                          {...field} 
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Amount</FormLabel>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          step="0.01" 
                          min="0" 
                          className="pl-7" 
                          {...field} 
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i> Generating...
                  </>
                ) : (
                  <>
                    <i className="ri-file-add-line mr-2"></i> Generate Invoice
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ManualInvoiceForm;
