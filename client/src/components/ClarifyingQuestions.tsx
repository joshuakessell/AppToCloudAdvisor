import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowRight, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const clarifyingQuestionsSchema = z.object({
  targetPlayerCount: z.string().optional(),
  geographicReach: z.string().optional(),
  latencyRequirements: z.string().optional(),
  primaryGameModes: z.array(z.string()).optional(),
  monetizationStrategy: z.string().optional(),
  developmentStage: z.string().optional(),
  multiplayerPlans: z.string().optional(),
  additionalRequirements: z.string().optional(),
});

type ClarifyingQuestionsFormData = z.infer<typeof clarifyingQuestionsSchema>;

interface ClarifyingQuestionsProps {
  gameId: string;
  gameName: string;
  onComplete: (responses: any) => void;
  comprehensiveAnalysis?: any;
}

export function ClarifyingQuestions({ gameId, gameName, onComplete, comprehensiveAnalysis }: ClarifyingQuestionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClarifyingQuestionsFormData>({
    resolver: zodResolver(clarifyingQuestionsSchema),
    defaultValues: {
      targetPlayerCount: "",
      geographicReach: "",
      latencyRequirements: "",
      primaryGameModes: [],
      monetizationStrategy: "",
      developmentStage: comprehensiveAnalysis?.currentState?.developmentStage || "",
      multiplayerPlans: "",
      additionalRequirements: "",
    },
  });

  const onSubmit = async (data: ClarifyingQuestionsFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/games/${gameId}/clarifying-responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit responses");
      }

      const result = await response.json();
      onComplete(result);
    } catch (error: any) {
      console.error("Failed to submit clarifying responses:", error);
      alert(error.message || "Failed to submit responses");
    } finally {
      setIsSubmitting(false);
    }
  };

  const gameModeOptions = [
    { id: "deathmatch", label: "Deathmatch / Free-for-All" },
    { id: "team_based", label: "Team-based Matches" },
    { id: "battle_royale", label: "Battle Royale" },
    { id: "cooperative", label: "Co-op / PvE" },
    { id: "mmo", label: "MMO / Persistent World" },
    { id: "turn_based", label: "Turn-based Multiplayer" },
    { id: "racing", label: "Racing / Competitive" },
    { id: "arena", label: "Arena / Competitive Ranked" },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        <h2 className="text-2xl font-bold" data-testid="text-clarifying-title">
          Tell us about your multiplayer vision
        </h2>
        <p className="text-muted-foreground" data-testid="text-clarifying-description">
          Help us recommend the perfect AWS GameLift migration path for <span className="font-semibold">{gameName}</span>
        </p>
      </motion.div>

      <Form {...form}>
        <motion.form
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Target Player Count */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Expected Player Scale
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>How many concurrent players do you expect at peak times?</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription>
                How many players do you expect to have playing simultaneously?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="targetPlayerCount"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {[
                          { value: "10s", label: "10-100 players", desc: "Small indie game or prototype" },
                          { value: "100s", label: "100-1,000 players", desc: "Medium multiplayer game" },
                          { value: "1000s", label: "1,000-10,000 players", desc: "Popular online game" },
                          { value: "10000s_plus", label: "10,000+ players", desc: "AAA or viral game" },
                        ].map((option) => (
                          <FormItem
                            key={option.value}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={option.value} data-testid={`radio-player-count-${option.value}`} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-normal cursor-pointer">
                                {option.label}
                              </FormLabel>
                              <FormDescription>{option.desc}</FormDescription>
                            </div>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Geographic Reach */}
          <Card>
            <CardHeader>
              <CardTitle>Geographic Reach</CardTitle>
              <CardDescription>
                Where will your players be located?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="geographicReach"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-geographic-reach">
                          <SelectValue placeholder="Select target regions" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="regional">Regional (Single country/region)</SelectItem>
                        <SelectItem value="continental">Continental (North America, Europe, Asia)</SelectItem>
                        <SelectItem value="global">Global (Worldwide)</SelectItem>
                        <SelectItem value="not_sure">Not sure yet</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Latency Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Latency Requirements</CardTitle>
              <CardDescription>
                How important is low latency for your game?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="latencyRequirements"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-latency-requirements">
                          <SelectValue placeholder="Select latency needs" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ultra_low">Ultra-low (&lt;50ms) - Competitive FPS/Fighting games</SelectItem>
                        <SelectItem value="low">Low (&lt;100ms) - Action games, Racing</SelectItem>
                        <SelectItem value="moderate">Moderate (&lt;200ms) - Strategy, RPG, MOBA</SelectItem>
                        <SelectItem value="flexible">Flexible - Turn-based, Casual games</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Primary Game Modes */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Game Modes</CardTitle>
              <CardDescription>
                Select all multiplayer modes you plan to support (select multiple)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="primaryGameModes"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {gameModeOptions.map((mode) => (
                        <FormField
                          key={mode.id}
                          control={form.control}
                          name="primaryGameModes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={mode.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(mode.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), mode.id])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== mode.id)
                                          );
                                    }}
                                    data-testid={`checkbox-game-mode-${mode.id}`}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {mode.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Monetization Strategy */}
          <Card>
            <CardHeader>
              <CardTitle>Monetization Strategy</CardTitle>
              <CardDescription>
                How do you plan to monetize your game?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="monetizationStrategy"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-monetization-strategy">
                          <SelectValue placeholder="Select monetization model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="free_to_play">Free-to-Play (F2P)</SelectItem>
                        <SelectItem value="premium">Premium (One-time purchase)</SelectItem>
                        <SelectItem value="subscription">Subscription-based</SelectItem>
                        <SelectItem value="hybrid">Hybrid (Premium + DLC/Cosmetics)</SelectItem>
                        <SelectItem value="not_decided">Not decided yet</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Development Stage */}
          <Card>
            <CardHeader>
              <CardTitle>Development Stage</CardTitle>
              <CardDescription>
                What stage is your game currently in?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="developmentStage"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-development-stage">
                          <SelectValue placeholder="Select development stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="prototype">Prototype / Proof of Concept</SelectItem>
                        <SelectItem value="alpha">Alpha (Internal testing)</SelectItem>
                        <SelectItem value="beta">Beta (External testing)</SelectItem>
                        <SelectItem value="production">Production (Pre-launch)</SelectItem>
                        <SelectItem value="live">Live / Released</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Multiplayer Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Multiplayer Priority</CardTitle>
              <CardDescription>
                How important is multiplayer for your game?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="multiplayerPlans"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-multiplayer-plans">
                          <SelectValue placeholder="Select multiplayer priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="primary_focus">Primary Focus - The core experience</SelectItem>
                        <SelectItem value="important_feature">Important Feature - Key but not the only focus</SelectItem>
                        <SelectItem value="future_feature">Future Feature - Planning to add later</SelectItem>
                        <SelectItem value="exploring">Exploring Options - Still deciding</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Additional Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Requirements (Optional)</CardTitle>
              <CardDescription>
                Any other specific needs or constraints we should know about?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="additionalRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Budget constraints, specific AWS services you're already using, compliance requirements, etc."
                        className="min-h-[100px]"
                        {...field}
                        data-testid="textarea-additional-requirements"
                      />
                    </FormControl>
                    <FormDescription>
                      This helps us provide more tailored recommendations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              data-testid="button-submit-clarifying"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Migration Plan...
                </>
              ) : (
                <>
                  Generate Migration Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </Form>
    </div>
  );
}
