import { z } from "zod";

/**
 * Zod schemas for every PokeAPI shape the app consumes. Unknown keys are
 * stripped (zod's default), so we declare only the fields we use — this keeps
 * the schemas resilient to PokeAPI adding fields.
 */

/** A `{ name, url }` reference, ubiquitous across the API. */
export const namedResourceSchema = z.object({
  name: z.string(),
  url: z.string(),
});
export type NamedResource = z.infer<typeof namedResourceSchema>;

/** Paginated list envelope: `/pokemon`, `/berry`, ... */
export const resourceListSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(namedResourceSchema),
});
export type ResourceList = z.infer<typeof resourceListSchema>;

/* --------------------------------------------------------------------------
   Pokémon
   -------------------------------------------------------------------------- */

const spriteSet = z.object({
  front_default: z.string().nullable().optional(),
  back_default: z.string().nullable().optional(),
  front_shiny: z.string().nullable().optional(),
  back_shiny: z.string().nullable().optional(),
});

export const pokemonSchema = z.object({
  id: z.number(),
  name: z.string(),
  height: z.number(),
  weight: z.number(),
  base_experience: z.number().nullable().optional(),
  order: z.number().nullable().optional(),
  sprites: spriteSet.extend({
    other: z
      .object({
        "official-artwork": z
          .object({
            front_default: z.string().nullable().optional(),
            front_shiny: z.string().nullable().optional(),
          })
          .optional(),
        home: z
          .object({
            front_default: z.string().nullable().optional(),
          })
          .optional(),
        dream_world: z
          .object({
            front_default: z.string().nullable().optional(),
          })
          .optional(),
      })
      .optional(),
  }),
  cries: z
    .object({
      latest: z.string().nullable().optional(),
      legacy: z.string().nullable().optional(),
    })
    .optional(),
  types: z.array(
    z.object({
      slot: z.number(),
      type: namedResourceSchema,
    })
  ),
  stats: z.array(
    z.object({
      base_stat: z.number(),
      effort: z.number(),
      stat: namedResourceSchema,
    })
  ),
  abilities: z.array(
    z.object({
      ability: namedResourceSchema,
      is_hidden: z.boolean(),
      slot: z.number(),
    })
  ),
  moves: z.array(
    z.object({
      move: namedResourceSchema,
    })
  ),
  species: namedResourceSchema,
});
export type Pokemon = z.infer<typeof pokemonSchema>;

/* --------------------------------------------------------------------------
   Species + evolution
   -------------------------------------------------------------------------- */

export const speciesSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: namedResourceSchema.optional(),
  evolution_chain: z.object({ url: z.string() }).nullable().optional(),
  is_legendary: z.boolean().optional(),
  is_mythical: z.boolean().optional(),
  genera: z
    .array(
      z.object({
        genus: z.string(),
        language: namedResourceSchema,
      })
    )
    .optional(),
  flavor_text_entries: z
    .array(
      z.object({
        flavor_text: z.string(),
        language: namedResourceSchema,
        version: namedResourceSchema.optional(),
      })
    )
    .optional(),
});
export type Species = z.infer<typeof speciesSchema>;

/** Recursive evolution chain link. */
export interface EvolutionLink {
  species: NamedResource;
  evolves_to: EvolutionLink[];
  evolution_details: {
    min_level: number | null;
    trigger: NamedResource | null;
    item: NamedResource | null;
  }[];
}

export const evolutionLinkSchema: z.ZodType<EvolutionLink> = z.lazy(() =>
  z.object({
    species: namedResourceSchema,
    evolution_details: z.array(
      z.object({
        min_level: z.number().nullable().optional().default(null),
        trigger: namedResourceSchema.nullable().optional().default(null),
        item: namedResourceSchema.nullable().optional().default(null),
      })
    ),
    evolves_to: z.array(evolutionLinkSchema),
  })
);

export const evolutionChainSchema = z.object({
  id: z.number(),
  chain: evolutionLinkSchema,
});
export type EvolutionChain = z.infer<typeof evolutionChainSchema>;

/* --------------------------------------------------------------------------
   Type + generation (filters)
   -------------------------------------------------------------------------- */

export const typeSchema = z.object({
  id: z.number(),
  name: z.string(),
  pokemon: z.array(
    z.object({
      slot: z.number(),
      pokemon: namedResourceSchema,
    })
  ),
});
export type TypeResource = z.infer<typeof typeSchema>;

export const generationSchema = z.object({
  id: z.number(),
  name: z.string(),
  pokemon_species: z.array(namedResourceSchema),
});
export type Generation = z.infer<typeof generationSchema>;

/* --------------------------------------------------------------------------
   Berries
   -------------------------------------------------------------------------- */

export const berrySchema = z.object({
  id: z.number(),
  name: z.string(),
  growth_time: z.number(),
  max_harvest: z.number(),
  natural_gift_power: z.number(),
  size: z.number(),
  smoothness: z.number(),
  soil_dryness: z.number(),
  firmness: namedResourceSchema,
  flavors: z.array(
    z.object({
      potency: z.number(),
      flavor: namedResourceSchema,
    })
  ),
  natural_gift_type: namedResourceSchema,
  item: namedResourceSchema.optional(),
});
export type Berry = z.infer<typeof berrySchema>;
