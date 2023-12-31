import { Injectable } from '@angular/core'
import { Observable, combineLatest, defaultIfEmpty, forkJoin, map, of, switchMap } from 'rxjs'
import { PokemonsResponseDto, PokemonResponseDto, PokemonType, PokemonsByTypeResponseDto, PokemonByTypeDto } from '@gt-motive-app/libs/models';
import { PokemonService } from '@gt-motive-app/services/pokemon'

@Injectable()
export class PokemonListService extends PokemonService {
    
    public getPokemonPage(page: number, pageSize: number): Observable<PokemonsResponseDto> {
        return this.getRawPokemons(page, pageSize).pipe(
            switchMap((pokemons: PokemonsResponseDto) => {
                const requests = pokemons.results.map((pokemon: PokemonResponseDto) => this.getRawPokemon(pokemon.name))
                return combineLatest([of(pokemons), forkJoin<PokemonResponseDto[]>(requests)]);
            }),
            map(([pokemons, rawPokemons]: [PokemonsResponseDto, PokemonResponseDto[]]) => {
                return {
                    ...pokemons,
                    results: rawPokemons
                };
            })
        )
    }

    public getFilteredPokemonPage(pokemonType: PokemonType): Observable<PokemonsResponseDto> {
        return this.getRawPokemonsByType(pokemonType).pipe(
            switchMap((pokemonsByType: PokemonsByTypeResponseDto) => {
                const requests = pokemonsByType.pokemon.map((pokemon: PokemonByTypeDto) => this.getRawPokemon(pokemon.pokemon.name))
                return forkJoin<PokemonResponseDto[]>(requests).pipe(
                    defaultIfEmpty([])
                  );
            }),
            map((rawPokemons: PokemonResponseDto[]) => {
                return {
                    count: rawPokemons.length,
                    results: rawPokemons
                } as PokemonsResponseDto;
            })
        )
    }
}