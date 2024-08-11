import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MovieDocument = Movie & Document;
@Schema({ timestamps: true })
export class Movie {
  // tmdbId
  @Prop({ type: Number })
  tmdbId: number;

  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  overview: string;

  @Prop({ type: Date })
  releaseDate: Date;

  @Prop({ type: String })
  posterPath: string;

  // image
  @Prop({ type: String })
  image: string;

  // adult
  @Prop({ type: Boolean })
  adult: boolean;

  // genre
  @Prop({ type: [String] })
  genres: string[];

  @Prop({ type: [Number], default: [] })
  userRatings: number[]; // Array to store individual user ratings

  @Prop({ type: Number, default: 0 })
  averageRating: number;

  //tmdbRating
  @Prop({ type: Number, default: 0 })
  tmdbRating: number;

  @Prop({ type: Boolean, default: false })
  removed: boolean;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
